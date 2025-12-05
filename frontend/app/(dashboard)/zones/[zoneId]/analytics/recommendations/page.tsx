'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useZone, useZoneRecommendations } from '@/lib/hooks';
import type { Recommendation } from '@/types';

/**
 * Zone-specific optimization recommendations page
 * Displays actionable recommendations sorted by priority
 */
export default function ZoneRecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;

  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);

  // Fetch recommendations for this zone
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useZoneRecommendations(zoneId);

  // Sort recommendations by priority
  const sortedRecommendations = recommendations
    ? [...recommendations].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    : [];

  // Show loading state
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Loading Zone...
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Not Found
            </h1>
          </div>
        </div>

        <div className="retro-card fog-overlay border-blood-red">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💀</span>
            <p className="font-vt323 text-lg text-blood-red mb-4">
              This zone has vanished into the mist!
            </p>
            <button onClick={() => router.push('/')} className="retro-button">
              Return to Zone Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/zones/${zoneId}/analytics`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to {zone.name} Analytics
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl">💡</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            {zone.name} - Optimization Recommendations
          </h1>
        </div>

        <p className="mt-4 font-vt323 text-text-secondary">
          Actionable insights to improve yield and efficiency in this zone
        </p>
      </div>

      {/* Recommendations List */}
      {recommendationsLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : recommendationsError ? (
        <div className="retro-card fog-overlay border-pumpkin-orange">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">⚠️</span>
            <p className="font-vt323 text-lg text-pumpkin-orange mb-4">
              Failed to load recommendations
            </p>
            <p className="font-vt323 text-sm text-text-secondary mb-4">
              The spirits are having trouble reading the signs...
            </p>
            <button onClick={() => window.location.reload()} className="retro-button">
              Try Again
            </button>
          </div>
        </div>
      ) : sortedRecommendations.length > 0 ? (
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      ) : (
        <div className="retro-card fog-overlay border-ghost-green">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">✨</span>
            <p className="font-vt323 text-lg text-ghost-green mb-4">
              Optimal Conditions Achieved!
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              Your zone is running perfectly. The spirits are pleased! 👻
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Recommendation Card Component
 * Displays a single recommendation with expandable details
 */
interface RecommendationCardProps {
  recommendation: Recommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get priority styling
  const getPriorityStyles = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return {
          borderColor: 'border-blood-red',
          badgeColor: 'bg-blood-red text-bone-white',
          icon: '🔥',
        };
      case 'medium':
        return {
          borderColor: 'border-pumpkin-orange',
          badgeColor: 'bg-pumpkin-orange text-bone-white',
          icon: '⚡',
        };
      case 'low':
        return {
          borderColor: 'border-ghost-green',
          badgeColor: 'bg-ghost-green text-bg-darkest',
          icon: '💡',
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'environment':
        return '🌡️';
      case 'irrigation':
        return '💧';
      case 'energy':
        return '⚡';
    }
  };

  const styles = getPriorityStyles(recommendation.priority);
  const categoryIcon = getCategoryIcon(recommendation.category);

  return (
    <Card className={`${styles.borderColor} transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{styles.icon}</span>
              <span className="text-xl">{categoryIcon}</span>
              <CardTitle className="flex-1">{recommendation.title}</CardTitle>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`${styles.badgeColor} px-3 py-1 text-xs font-vt323 uppercase pixel-corners`}
              >
                {recommendation.priority} Priority
              </span>
              <span className="text-xs font-vt323 text-text-secondary uppercase px-3 py-1 bg-bg-dark pixel-corners">
                {recommendation.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-ghost-green hover:text-slime-green transition-colors font-vt323 text-sm flex items-center gap-1"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Description - Always visible */}
        <p className="font-vt323 text-text-secondary mb-4">{recommendation.description}</p>

        {/* Expected Impact - Always visible */}
        <div className="mb-4 p-3 bg-bg-dark border-2 border-ghost-green rounded pixel-corners">
          <div className="flex items-start gap-2">
            <span className="text-xl">📈</span>
            <div>
              <p className="font-vt323 text-sm text-ghost-green font-bold mb-1">
                Expected Impact:
              </p>
              <p className="font-vt323 text-sm text-text-secondary">
                {recommendation.expectedImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Action Items */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-bg-medium border-2 border-toxic-purple rounded pixel-corners animate-fade-in">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xl">📋</span>
              <p className="font-vt323 text-toxic-purple font-bold">Action Items:</p>
            </div>
            <ul className="space-y-2 ml-8">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="font-vt323 text-sm text-text-secondary flex gap-2">
                  <span className="text-ghost-green">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Timestamp */}
            <div className="mt-4 pt-3 border-t border-toxic-purple/30">
              <p className="font-vt323 text-xs text-text-secondary">
                Generated: {new Date(recommendation.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
