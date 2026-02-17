'use client';

'use client';
import Link from 'next/link';

export default function SupportAnalyticsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Support Analytics</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Tickets</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    <span className="text-green-600 text-sm flex items-center mt-2">
                        <i className="ri-arrow-up-line mr-1"></i> 0% this month
                    </span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Avg. Response Time</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0m</p>
                    <span className="text-gray-400 text-sm mt-2">No data yet</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Satisfaction Score</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">N/A</p>
                    <div className="flex text-yellow-400 mt-2 text-sm">
                        <i className="ri-star-line"></i>
                        <i className="ri-star-line"></i>
                        <i className="ri-star-line"></i>
                        <i className="ri-star-line"></i>
                        <i className="ri-star-line"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-bar-chart-groupted-line text-2xl text-indigo-500"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Detailed Reports Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                    We are gathering data on your support performance. Check back later for detailed insights.
                </p>
            </div>
        </div>
    );
}
