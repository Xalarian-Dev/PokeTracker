import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { GenerationStats } from '../components/GenerationStats';
import { SpecialStats } from '../components/SpecialStats';
import { RegionalStats } from '../components/RegionalStats';
import { GameStats } from '../components/GameStats';

/** Statistiques de la collection (par génération, spéciaux, régions, jeux) */
const StatsPage: React.FC = () => {
    const { t } = useLanguage();
    const { pokemonList, shinyPokemons } = useCollection();

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-4">{t('stats_tab')}</h1>
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <GenerationStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                <SpecialStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                <RegionalStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
                <GameStats pokemonList={pokemonList} shinyPokemons={shinyPokemons} />
            </div>
        </div>
    );
};

export default StatsPage;
