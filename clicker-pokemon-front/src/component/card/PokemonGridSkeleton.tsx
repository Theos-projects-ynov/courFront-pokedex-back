import React from "react";
import { Skeleton } from "@mui/material";

interface PokemonGridSkeletonProps {
  count?: number;
}

const PokemonGridSkeleton: React.FC<PokemonGridSkeletonProps> = ({
  count = 20,
}) => {
  return (
    <div className="pokemon-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="pokemon-card">
          <div className="card skeleton-card">
            <div className="card-image-container">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={150}
                sx={{ borderRadius: "8px" }}
              />
            </div>
            <div className="card-content">
              <Skeleton
                variant="text"
                width="80%"
                height={24}
                sx={{ marginBottom: "8px" }}
              />
              <Skeleton variant="text" width="60%" height={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PokemonGridSkeleton;
