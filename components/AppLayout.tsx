import React from 'react';
import { Outlet } from 'react-router-dom';
import type { Pokemon, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { usePokemonData } from '../hooks/usePokemonData';
import type { CollectionContext } from '../contexts/CollectionContext';
import Header from './Header';
import BottomNav from './BottomNav';
import ConfirmationModal from './ConfirmationModal';
import { TrainerIdSetup } from './TrainerIdSetup';

interface AppLayoutProps {
    user: User | null;
    pokemonList: Pokemon[];
}

/**
 * Cadre commun des pages de l'application : en-tête avec navigation, barre du bas (mobile),
 * chargement des données de la collection (partagées aux pages via le contexte de l'<Outlet>).
 */
const AppLayout: React.FC<AppLayoutProps> = ({ user, pokemonList }) => {
    const { t } = useLanguage();
    const data = usePokemonData({ username: user?.username ?? null });

    const context: CollectionContext = {
        pokemonList,
        shinyPokemons: data.shinyPokemons,
        setShinyPokemons: data.setShinyPokemons,
        loading: data.loading,
        ownedGames: data.ownedGames,
        userId: data.userId,
        validatedForms: data.validatedForms,
        shinyForms: data.shinyForms,
        favoriteForms: data.favoriteForms,
        toggleShiny: data.toggleShiny,
        captureShiny: data.captureShiny,
        shinyDetails: data.shinyDetails,
        editShinyDetails: data.editShinyDetails,
        toggleForm: data.toggleForm,
        setFavoriteForm: data.setFavoriteForm,
    };

    return (
        <div className="app-bg text-white min-h-screen">
            <Header trainerId={data.trainerId} />

            {user && !data.loading && data.trainerId === null && (
                <TrainerIdSetup onComplete={(id) => data.setTrainerIdState(id)} />
            )}

            <ConfirmationModal
                isOpen={data.pendingMigration !== null}
                onClose={data.dismissMigration}
                onConfirm={data.confirmMigration}
                message={t('migrate_local_data')}
                confirmLabel={t('migrate_sync')}
                cancelLabel={t('migrate_skip')}
            />

            <main>
                <Outlet context={context} />
            </main>

            <BottomNav />
        </div>
    );
};

export default AppLayout;
