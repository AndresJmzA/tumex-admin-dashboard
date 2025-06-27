
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Good Morning!</h1>
        <p className="text-gray-600">Welcome back to your TUMex medical equipment platform</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="bg-tumex-primary-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-tumex-primary-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <div className="bg-green-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Support Tickets</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-red-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 tumex-card-radius bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "New rental request", item: "Ultrasound Machine XR-200", status: "pending", time: "2 hours ago" },
            { action: "Order completed", item: "Surgical Tools Set", status: "completed", time: "4 hours ago" },
            { action: "Equipment returned", item: "Patient Monitor PM-500", status: "returned", time: "1 day ago" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.item}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={activity.status === 'completed' ? 'default' : activity.status === 'pending' ? 'secondary' : 'outline'}
                  className="tumex-button-radius"
                >
                  {activity.status}
                </Badge>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
