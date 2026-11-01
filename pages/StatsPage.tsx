import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { GenerationStats } from '../components/GenerationStats';
import { SpecialStats } from '../components/SpecialStats';
import { RegionalStats } from '../components/RegionalStats';
import { GameStats } from '../components/GameStats';

/** Statistiques de la collection (par génération, spéciaux, régions, jeux) : pleine largeur sur ordinateur */
const StatsPage: React.FC = () => {
    const { t } = useLanguage();
    const { pokemonList, shinyPokemons } = useCollection();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">{t('stats_tab')}</h1>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <GenerationStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                </div>
                <SpecialStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                <RegionalStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                <div className="lg:col-span-2">
                    <GameStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
