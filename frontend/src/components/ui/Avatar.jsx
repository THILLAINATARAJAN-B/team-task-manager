import { getInitials, getAvatarColor } from '../../utils/helpers'

export default function Avatar({ name, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-sm' }
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  )
}