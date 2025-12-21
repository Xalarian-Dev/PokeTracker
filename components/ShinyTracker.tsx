
import React, { useState, useEffect, useMemo } from 'react';
import type { Pokemon, User } from '../types';
import Header from './Header';
import SearchBar from './SearchBar';
import PokemonCard from './PokemonCard';
import { POKEMON_AVAILABILITY, GAME_GROUP_MAP } from '../data/games';
import { useLanguage } from '../contexts/LanguageContext';

interface ShinyTrackerProps {
  user: User;
  onLogout: () => void;
  pokemonList: Pokemon[];
}

const ShinyTracker: React.FC<ShinyTrackerProps> = ({ user, onLogout, pokemonList }) => {
  const [shinyPokemons, setShinyPokemons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyShiny, setShowOnlyShiny] = useState(false);
  const [showMissingShiny, setShowMissingShiny] = useState(false);
  const [hideRegionalForms, setHideRegionalForms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<{ type: 'gen' | 'region'; value: string | number } | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { t } = useLanguage();

  const storageKey = `shinyTrackerData_${user.username}`;

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setShinyPokemons(new Set(JSON.parse(storedData)));
      }
    } catch (error) {
        console.error("Failed to load shiny data from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if(!loading) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(shinyPokemons)));
        } catch (error) {
            console.error("Failed to save shiny data to localStorage", error);
        }
    }
  }, [shinyPokemons, storageKey, loading]);

  const toggleShiny = (pokemonId: string) => {
    setShinyPokemons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pokemonId)) {
        newSet.delete(pokemonId);
      } else {
        newSet.add(pokemonId);
      }
      return newSet;
    });
  };

  const filteredPokemon = useMemo(() => {
    return pokemonList.filter(pokemon => {
      const matchesFilter = !activeFilter ||
        (activeFilter.type === 'gen' && pokemon.generation === activeFilter.value) ||
        (activeFilter.type === 'region' && pokemon.region === activeFilter.value);
      
      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            pokemon.id.includes(searchTerm);
      
      const matchesShiny = !showOnlyShiny || shinyPokemons.has(pokemon.id);
      
      const matchesMissing = !showMissingShiny || !shinyPokemons.has(pokemon.id);

      const matchesRegional = !hideRegionalForms || !pokemon.id.includes('-');

      const matchesGame = selectedGame === null ||
        (POKEMON_AVAILABILITY[pokemon.id] &&
         GAME_GROUP_MAP[selectedGame]?.some(gameKey => 
            POKEMON_AVAILABILITY[pokemon.id].includes(gameKey)
         ));

      return matchesFilter && matchesSearch && matchesShiny && matchesMissing && matchesRegional && matchesGame;
    });
  }, [pokemonList, searchTerm, showOnlyShiny, showMissingShiny, hideRegionalForms, shinyPokemons, activeFilter, selectedGame]);

  const shinyCount = shinyPokemons.size;
  const totalPokemon = pokemonList.length;
  const progress = totalPokemon > 0 ? (shinyCount / totalPokemon) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold">{t('shinydex_progress')}</h2>
            <p className="text-gray-400">{shinyCount} / {totalPokemon} {t('shiny_pokemon_caught')}</p>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-4 overflow-hidden">
                <div 
                    className="bg-yellow-400 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          showOnlyShiny={showOnlyShiny}
          setShowOnlyShiny={setShowOnlyShiny}
          showMissingShiny={showMissingShiny}
          setShowMissingShiny={setShowMissingShiny}
          hideRegionalForms={hideRegionalForms}
          setHideRegionalForms={setHideRegionalForms}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
        />
        
        {!loading && filteredPokemon.length > 0 && (
          <div className="mb-4 text-gray-400 text-sm px-1">
            {t('pokemon_shown', { count: filteredPokemon.length })}
          </div>
        )}

        {loading ? (
             <p className="text-center mt-8">{t('trainer_data_loading')}</p>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredPokemon.map(pokemon => (
                <PokemonCard 
                key={pokemon.id}
                pokemon={pokemon}
                isShiny={shinyPokemons.has(pokemon.id)}
                onToggleShiny={toggleShiny}
                selectedGame={selectedGame}
                />
            ))}
            </div>
        )}

        {!loading && filteredPokemon.length === 0 && (
            <div className="text-center py-16">
                <p className="text-xl text-gray-500">{t('no_pokemon_found')}</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default ShinyTracker;