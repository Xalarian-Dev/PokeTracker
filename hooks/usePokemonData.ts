import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPokemonForms, toggleFormShiny, setFavoriteForm as setFavoriteFormAPI } from '../services/pokemonFormsService';
import {
    fetchShinyPokemon,
    fetchShinyCollection,
    updateShinyDetails,
    type ShinyDetails,
    addShinyPokemon,
    removeShinyPokemon,
    migrateLocalStorageToSupabase,
    getUserPreferences
} from '../services/supabase';

interface UsePokemonDataParams {
    username: string | null;
}

export function usePokemonData({ username }: UsePokemonDataParams) {
    const { user: clerkUser } = useUser();
    const { getToken, isSignedIn } = useAuth();

    const [shinyPokemons, setShinyPokemons] = useState<Set<string>>(new Set());
    // Jeu et rencontres enregistrés avec certains shiny (page « Chasse »)
    const [shinyDetails, setShinyDetails] = useState<Map<string, ShinyDetails>>(new Map());
    const [loading, setLoading] = useState(true);
    const [ownedGames, setOwnedGames] = useState<string[]>([]);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [trainerId, setTrainerIdState] = useState<string | null>(null);
    const [validatedForms, setValidatedForms] = useState<Map<string, Set<string>>>(new Map());
    const [shinyForms, setShinyForms] = useState<Map<string, Set<string>>>(new Map());
    const [favoriteForms, setFavoriteForms] = useState<Map<string, string>>(new Map());
    // Données locales à proposer de synchroniser (affichées dans une fenêtre, plus de window.confirm)
    const [pendingMigration, setPendingMigration] = useState<string[] | null>(null);

    const { t } = useLanguage();
    const storageKey = username ? `shinyTrackerData_${username}` : null;
    const userId = clerkUser?.id;

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (!userId || !isSignedIn) {
                if (storageKey) {
                    try {
                        const storedData = localStorage.getItem(storageKey);
                        if (storedData) {
                            setShinyPokemons(new Set(JSON.parse(storedData)));
                        }
                    } catch {
                        // Failed to load from localStorage
                    }
                }
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                const { shinies, details } = await fetchShinyCollection();
                setShinyPokemons(shinies);
                setShinyDetails(details);

                const prefs = await getUserPreferences(userId);
                if (prefs?.owned_games) setOwnedGames(prefs.owned_games);
                if (prefs?.display_name) setDisplayName(prefs.display_name);
                if (prefs?.trainer_id) setTrainerIdState(prefs.trainer_id);

                try {
                    const formsData = await loadPokemonForms();
                    const shinyFormsMap = new Map<string, Set<string>>();
                    Object.entries(formsData.shinyForms).forEach(([pokemonId, formIds]) => {
                        shinyFormsMap.set(pokemonId, new Set(formIds));
                    });
                    setShinyForms(shinyFormsMap);

                    const favoriteFormsMap = new Map<string, string>();
                    Object.entries(formsData.favoriteForms).forEach(([pokemonId, formId]) => {
                        favoriteFormsMap.set(pokemonId, formId);
                    });
                    setFavoriteForms(favoriteFormsMap);
                } catch {
                    // Failed to load forms
                }

                if (storageKey) {
                    const localData = localStorage.getItem(storageKey);
                    if (localData) {
                        const localShinyIds = JSON.parse(localData);
                        if (localShinyIds.length > 0 && shinies.size === 0) {
                            setPendingMigration(localShinyIds);
                        }
                    }
                }
            } catch {
                // Failed to load from Supabase
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId, storageKey, getToken, isSignedIn]);

    // Save to localStorage for guests
    useEffect(() => {
        if (!loading && storageKey && !userId) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(Array.from(shinyPokemons)));
            } catch {
                // Failed to save to localStorage
            }
        }
    }, [shinyPokemons, storageKey, loading, userId]);

    const toggleShiny = useCallback(async (pokemonId: string) => {
        if (!userId) {
            setShinyPokemons(prev => {
                const newSet = new Set(prev);
                if (newSet.has(pokemonId)) {
                    newSet.delete(pokemonId);
                    setShinyForms(prevForms => {
                        const newFormsMap = new Map(prevForms);
                        newFormsMap.delete(pokemonId);
                        return newFormsMap;
                    });
                } else {
                    newSet.add(pokemonId);
                }
                return newSet;
            });
            return;
        }

        try {
            const isCurrentlyShiny = shinyPokemons.has(pokemonId);
            // Retirer ou (re)marquer un shiny par la grille repart sans jeu ni rencontres
            setShinyDetails(prev => {
                if (!prev.has(pokemonId)) return prev;
                const next = new Map(prev);
                next.delete(pokemonId);
                return next;
            });

            if (isCurrentlyShiny) {
                setShinyPokemons(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(pokemonId);
                    return newSet;
                });

                await removeShinyPokemon(userId, pokemonId);

                const formsForPokemon = shinyForms.get(pokemonId);
                if (formsForPokemon && formsForPokemon.size > 0) {
                    setShinyForms(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(pokemonId);
                        return newMap;
                    });

                    const untogglePromises = Array.from(formsForPokemon).map((formId: string) =>
                        toggleFormShiny(pokemonId, formId, false)
                    );
                    await Promise.all(untogglePromises);
                }
            } else {
                setShinyPokemons(prev => new Set([...prev, pokemonId]));
                await addShinyPokemon(userId, pokemonId);
            }
        } catch {
            const shinies = await fetchShinyPokemon(userId);
            setShinyPokemons(shinies);
        }
    }, [userId, shinyPokemons, shinyForms]);

    /** Page « Chasse » : marque le Pokémon comme capturé en shiny, avec le jeu et le nombre de rencontres du compteur */
    const captureShiny = useCallback(async (pokemonId: string, details: { game: string | null; encounters: number }) => {
        setShinyPokemons(prev => new Set(prev).add(pokemonId));
        if (!userId) return; // visiteur : pas de compte, le détail n'est pas enregistré
        setShinyDetails(prev => new Map(prev).set(pokemonId, details));
        try {
            await addShinyPokemon(userId, pokemonId, details);
        } catch (error) {
            const shinies = await fetchShinyPokemon(userId);
            setShinyPokemons(shinies);
            throw error;
        }
    }, [userId]);

    /** Page « Chasse » : modifie le jeu et les rencontres d'un shiny déjà capturé */
    const editShinyDetails = useCallback(async (pokemonId: string, details: ShinyDetails) => {
        if (!userId) throw new Error('Not signed in');
        const previous = shinyDetails.get(pokemonId);
        setShinyDetails(prev => new Map(prev).set(pokemonId, details));
        try {
            await updateShinyDetails(pokemonId, details);
        } catch (error) {
            setShinyDetails(prev => {
                const next = new Map(prev);
                if (previous) next.set(pokemonId, previous); else next.delete(pokemonId);
                return next;
            });
            throw error;
        }
    }, [userId, shinyDetails]);

    const toggleForm = useCallback(async (pokemonId: string, formId: string, _shouldBeShiny: boolean) => {
        const isCurrentlyShiny = shinyForms.get(pokemonId)?.has(formId) || false;
        const newShinyState = !isCurrentlyShiny;

        setShinyForms(prev => {
            const newMap = new Map<string, Set<string>>(prev);
            const existingShiny = newMap.get(pokemonId);
            const shinySet: Set<string> = existingShiny ? new Set(existingShiny) : new Set<string>();

            if (isCurrentlyShiny) {
                shinySet.delete(formId);
                if (shinySet.size === 0) {
                    newMap.delete(pokemonId);
                } else {
                    newMap.set(pokemonId, shinySet);
                }
            } else {
                shinySet.add(formId);
                newMap.set(pokemonId, shinySet);
            }
            return newMap;
        });

        await toggleFormShiny(pokemonId, formId, newShinyState);

        if (newShinyState) {
            setShinyPokemons(prev => new Set(prev).add(pokemonId));
            await addShinyPokemon(userId!, pokemonId);
        } else {
            const otherFormsShiny = Array.from(shinyForms.get(pokemonId) || [])
                .filter(id => id !== formId).length > 0;

            if (!otherFormsShiny) {
                setShinyPokemons(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(pokemonId);
                    return newSet;
                });
                await removeShinyPokemon(userId!, pokemonId);
            }
        }

        const currentFavorite = favoriteForms.get(pokemonId);
        if (newShinyState && !currentFavorite) {
            setFavoriteForms(prev => {
                const newMap = new Map(prev);
                newMap.set(pokemonId, formId);
                return newMap;
            });
            await setFavoriteFormAPI(pokemonId, formId);
        }
    }, [userId, shinyForms, favoriteForms]);

    const setFavoriteForm = useCallback(async (pokemonId: string, formId: string) => {
        setFavoriteForms(prev => {
            const newMap = new Map(prev);
            newMap.set(pokemonId, formId);
            return newMap;
        });
        await setFavoriteFormAPI(pokemonId, formId);
    }, []);

    const confirmMigration = useCallback(async () => {
        const ids = pendingMigration;
        setPendingMigration(null);
        if (!ids || !userId || !storageKey) return;
        try {
            await migrateLocalStorageToSupabase(userId, ids);
            const updatedShinies = await fetchShinyPokemon(userId);
            setShinyPokemons(updatedShinies);
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.error('Migration error:', e);
        }
    }, [pendingMigration, userId, storageKey]);

    const dismissMigration = useCallback(() => setPendingMigration(null), []);

    return {
        pendingMigration,
        confirmMigration,
        dismissMigration,
        shinyPokemons,
        setShinyPokemons,
        loading,
        ownedGames,
        displayName,
        trainerId,
        setTrainerIdState,
        validatedForms,
        shinyForms,
        favoriteForms,
        userId,
        toggleShiny,
        captureShiny,
        shinyDetails,
        editShinyDetails,
        toggleForm,
        setFavoriteForm,
    };
}
