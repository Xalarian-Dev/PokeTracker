// Remplace `api/_lib/supabase.ts` dans l'image Docker (voir server/build.mjs).
// Implémente, au-dessus d'un Postgres ordinaire (module `pg`), le petit sous-ensemble de l'API
// de requêtes de supabase-js que les fonctions `api/*` utilisent :
//   from(t).select(cols) / insert(obj) / update(obj) / upsert(obj, { onConflict }) / delete()
//   .eq(col, val) · .order(col, { ascending }) · .limit(n) · .single() · .maybeSingle()
// et renvoie `{ data, error }` comme supabase-js, avec les codes d'erreur Postgres (ex. 23505).
// Les fonctions `api/*` restent donc EXACTEMENT les mêmes que sur Vercel + Supabase.
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('Missing DATABASE_URL for backend');
}

export const pool = new pg.Pool({ connectionString, max: Number(process.env.PG_POOL_MAX || 10) });

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ident = (name: string): string => {
    if (!IDENT.test(name)) throw new Error(`Invalid identifier: ${name}`);
    return `"${name}"`;
};

type Row = Record<string, unknown>;
type Result = { data: any; error: { code?: string; message: string } | null };
type Action = 'select' | 'insert' | 'update' | 'upsert' | 'delete';

class QueryBuilder implements PromiseLike<Result> {
    private action: Action = 'select';
    private columns = '*';
    private payload: Row | null = null;
    private conflict: string[] = [];
    private filters: Array<[string, unknown]> = [];
    private orderBy: Array<[string, boolean]> = [];
    private limitN: number | null = null;
    private mode: 'many' | 'single' | 'maybeSingle' = 'many';
    private returning = false;

    constructor(private table: string) {}

    select(columns = '*') {
        if (this.action === 'select') this.columns = columns;
        else { this.returning = true; this.columns = columns; }
        return this;
    }
    insert(values: Row) { this.action = 'insert'; this.payload = values; return this; }
    update(values: Row) { this.action = 'update'; this.payload = values; return this; }
    upsert(values: Row, options?: { onConflict?: string }) {
        this.action = 'upsert';
        this.payload = values;
        this.conflict = (options?.onConflict || 'id').split(',').map(s => s.trim());
        return this;
    }
    delete() { this.action = 'delete'; return this; }
    eq(column: string, value: unknown) { this.filters.push([column, value]); return this; }
    order(column: string, options?: { ascending?: boolean }) { this.orderBy.push([column, options?.ascending !== false]); return this; }
    limit(n: number) { this.limitN = n; return this; }
    single() { this.mode = 'single'; return this; }
    maybeSingle() { this.mode = 'maybeSingle'; return this; }

    private columnList(): string {
        if (this.columns.trim() === '*') return '*';
        return this.columns.split(',').map(c => ident(c.trim())).join(', ');
    }

    private where(params: unknown[]): string {
        if (this.filters.length === 0) return '';
        return ' WHERE ' + this.filters.map(([c, v]) => { params.push(v); return `${ident(c)} = $${params.length}`; }).join(' AND ');
    }

    private build(): { text: string; params: unknown[]; returnsRows: boolean } {
        const t = ident(this.table);
        const params: unknown[] = [];
        const keys = this.payload ? Object.keys(this.payload) : [];
        const ret = () => ` RETURNING ${this.columnList()}`;
        switch (this.action) {
            case 'select': {
                let text = `SELECT ${this.columnList()} FROM ${t}${this.where(params)}`;
                if (this.orderBy.length) text += ' ORDER BY ' + this.orderBy.map(([c, asc]) => `${ident(c)} ${asc ? 'ASC' : 'DESC'}`).join(', ');
                if (this.limitN !== null) text += ` LIMIT ${Math.max(0, Math.floor(this.limitN))}`;
                return { text, params, returnsRows: true };
            }
            case 'insert': {
                keys.forEach(k => params.push(this.payload![k]));
                const text = `INSERT INTO ${t} (${keys.map(ident).join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')})` + (this.returning ? ret() : '');
                return { text, params, returnsRows: this.returning };
            }
            case 'upsert': {
                keys.forEach(k => params.push(this.payload![k]));
                const updates = keys.filter(k => !this.conflict.includes(k));
                const onConflict = updates.length
                    ? `DO UPDATE SET ${updates.map(k => `${ident(k)} = EXCLUDED.${ident(k)}`).join(', ')}`
                    : 'DO NOTHING';
                const text = `INSERT INTO ${t} (${keys.map(ident).join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) ON CONFLICT (${this.conflict.map(ident).join(', ')}) ${onConflict}` + (this.returning ? ret() : '');
                return { text, params, returnsRows: this.returning };
            }
            case 'update': {
                keys.forEach(k => params.push(this.payload![k]));
                const set = keys.map((k, i) => `${ident(k)} = $${i + 1}`).join(', ');
                const text = `UPDATE ${t} SET ${set}${this.where(params)}` + (this.returning ? ret() : '');
                return { text, params, returnsRows: this.returning };
            }
            case 'delete': {
                const text = `DELETE FROM ${t}${this.where(params)}` + (this.returning ? ret() : '');
                return { text, params, returnsRows: this.returning };
            }
        }
    }

    private async run(): Promise<Result> {
        try {
            const { text, params, returnsRows } = this.build();
            const res = await pool.query(text, params as any[]);
            if (!returnsRows) return { data: null, error: null };
            if (this.mode === 'single') {
                if (res.rows.length === 1) return { data: res.rows[0], error: null };
                return { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } };
            }
            if (this.mode === 'maybeSingle') {
                if (res.rows.length > 1) return { data: null, error: { code: 'PGRST116', message: 'multiple rows returned' } };
                return { data: res.rows[0] ?? null, error: null };
            }
            return { data: res.rows, error: null };
        } catch (e: any) {
            return { data: null, error: { code: e?.code, message: e?.message ?? String(e) } };
        }
    }

    then<T1 = Result, T2 = never>(
        onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
        onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
    ): PromiseLike<T1 | T2> {
        return this.run().then(onfulfilled, onrejected);
    }
}

export const supabaseAdmin = {
    from(table: string) {
        return new QueryBuilder(table);
    },
};
