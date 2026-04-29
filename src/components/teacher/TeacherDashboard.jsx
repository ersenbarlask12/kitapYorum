import { useState } from 'react'
import { Plus, BookOpen, RefreshCw, AlertCircle } from 'lucide-react'
import { useComments } from '../../hooks/useComments'
import { CommentCard } from './CommentCard'
import { EditCommentModal } from './EditCommentModal'
import { Modal } from '../ui/Modal'
import { CommentForm } from '../form/CommentForm'
import { Spinner } from '../ui/Spinner'
import { useToast } from '../ui/Toast'

export function TeacherDashboard() {
  const { comments, loading, error, addComment, updateComment, deleteComment, refetch } = useComments()
  const toast = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleAddComment(values) {
    setIsAdding(true)
    try {
      await addComment(values)
      setShowAddModal(false)
      toast.success('Yorumunuz başarıyla eklendi!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsAdding(false)
    }
  }

  async function handleSaveEdit(values) {
    if (!editingComment) return
    setIsSaving(true)
    try {
      await updateComment(editingComment.id, values)
      setEditingComment(null)
      toast.success('Yorumunuz başarıyla güncellendi!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteComment(id)
      toast.success('Yorum başarıyla silindi!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">Yorumlarım</h2>
          <p className="text-gray-500 text-sm mt-1">
            {comments.length > 0
              ? `${comments.length} yorum kaydedildi`
              : 'Henüz hiç yorum eklemediniz'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gold"
        >
          <Plus size={20} />
          Yeni Yorum Ekle
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={refetch} className="btn-ghost text-sm">
            <RefreshCw size={14} /> Tekrar Dene
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="spinner-wrapper">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-gray-500 text-sm">Yorumlar yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-navy-50 rounded-3xl mb-4">
            <BookOpen className="text-navy-400" size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-display font-bold text-navy-700 mb-2">Henüz Yorum Yok</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Ders kitapları hakkındaki değerlendirmelerinizi ekleyerek başlayın.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={18} /> İlk Yorumunuzu Ekleyin
          </button>
        </div>
      )}

      {/* Comments Grid */}
      {!loading && comments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onEdit={setEditingComment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Comment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yeni Yorum Ekle"
        size="lg"
      >
        <CommentForm onSubmit={handleAddComment} isSubmitting={isAdding} />
      </Modal>

      {/* Edit Comment Modal */}
      <EditCommentModal
        comment={editingComment}
        isOpen={!!editingComment}
        onClose={() => setEditingComment(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </div>
  )
}
