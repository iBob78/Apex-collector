'use client'

import { UserProfile } from '@/types/user'

interface UserStatsProps {
  user: UserProfile
}

export default function UserStats({ user }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Cards Owned"
        value={user.statistics.cards_owned}
        icon="🃏"
      />
      <StatCard
        title="Collections Completed"
        value={user.statistics.collections_completed}
        icon="📚"
      />
      <StatCard
        title="Successful Trades"
        value={user.statistics.successful_trades}
        icon="🤝"
      />
      
      <div className="md:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {/* Add recent activity component here */}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: string
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
