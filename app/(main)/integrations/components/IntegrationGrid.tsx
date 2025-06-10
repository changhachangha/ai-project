"use client"

import { motion } from "framer-motion"
import type { Integration } from "../../../data/types"
import IntegrationCard from "./IntegrationCard"

type IntegrationGridProps = {
  integrations: Integration[]
  onSelectIntegration: (integration: Integration) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

export default function IntegrationGrid({
  integrations,
  onSelectIntegration,
  favorites,
  onToggleFavorite,
}: IntegrationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {integrations.map((integration, index) => (
        <motion.div
          key={integration.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <IntegrationCard
            integration={integration}
            onSelect={onSelectIntegration}
            isFavorite={favorites.includes(integration.id)}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </div>
  )
}
