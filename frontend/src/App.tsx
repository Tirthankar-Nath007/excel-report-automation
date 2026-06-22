import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { TransactionUpload } from './pages/TransactionUpload'
import { MergeReports } from './pages/MergeReports'
import { FolderUploadPage } from './pages/FolderUploadPage'

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 0 },
  },
})

type TabId = 'folder' | 'upload' | 'merge'

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: 'folder',
    label: 'Folder Upload',
    description: 'Primary workflow — select a folder with portfolio sub-folders',
  },
  {
    id: 'upload',
    label: 'Transaction Upload',
    description: 'Upload individual ONLINE transaction report files',
  },
  {
    id: 'merge',
    label: 'Merge Reports',
    description: 'Combine previously generated portfolio reports',
  },
]

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('folder')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <svg
            className="h-7 w-7 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Perfios Report Processor
            </h1>
            <p className="text-xs text-gray-500">
              Internal tool — TVSCS Product Team
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.id === 'folder' && (
                  <span className="ml-1.5 bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded font-medium">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page description */}
      <div className="max-w-5xl mx-auto px-6 py-3">
        <p className="text-xs text-gray-500">
          {TABS.find((t) => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {activeTab === 'folder' && <FolderUploadPage />}
          {activeTab === 'upload' && <TransactionUpload />}
          {activeTab === 'merge' && <MergeReports />}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { fontSize: '14px' },
        }}
      />
      <AppShell />
    </QueryClientProvider>
  )
}
