import React, { useState, useEffect } from 'react';
import CardProfil from '../card/CardProfil';
import { ITrainer } from '../../types/trainer';
import { genTeamPokemon } from '../../utils/genTeamPokemon';

function ProfilPage() {
    const [trainers, setTrainers] = useState<ITrainer[]>(initialTrainers);
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        (async () => {
            const newTrs = await Promise.all(
                initialTrainers.map(async tr => ({
                    ...tr,
                    teamPokemon: await genTeamPokemon(),
                }))
            );
            setTrainers(newTrs);
        })();
    }, []);

    const handleTrainerActive = (idx: number) => setActiveIdx(idx);

    return (
        <>
            <h1>Profil</h1>
            <CarrouselCard
                trainers={trainers}
                activeIdx={activeIdx}
                onSelect={handleTrainerActive}
            />
            <CardProfil {...trainers[activeIdx]} />
        </>
    );
}

export default ProfilPage; 