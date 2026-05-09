import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, FolderKanban } from 'lucide-react'
import api from '../api/axios'
import ProjectCard from '../components/project/ProjectCard'
import ProjectForm from '../components/project/ProjectForm'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch]       = useState('')
  const queryClient               = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then(r => r.data),
  })

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSuccess = () => {
    setShowModal(false)
    queryClient.invalidateQueries(['projects'])
    queryClient.invalidateQueries(['dashboard'])
  }

  const handleDelete = (id) => {
    queryClient.setQueryData(['projects'], (old) => old?.filter(p => p.id !== id))
    queryClient.invalidateQueries(['dashboard'])
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-surface-900">Projects</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="input pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-44 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'No projects match your search' : 'No projects yet'}
          description={search ? undefined : 'Create your first project to start tracking work'}
          action={!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> Create Project
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Project"
        description="Set up a new project for your team"
      >
        <ProjectForm onSuccess={handleSuccess} />
      </Modal>
    </div>
  )
}