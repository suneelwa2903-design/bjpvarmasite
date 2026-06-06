/**
 * Inline guidance shown above CMS image upload inputs. Built so that an admin
 * uploading a photo sees the exact dimensions, format, and crop tip for the
 * section they're editing — without having to read IMAGE_DIMENSIONS_GUIDE.md.
 *
 * Keep the props concise. Three lines max in the rendered output.
 */

interface UploadGuidanceProps {
  dimensions: string
  format: string
  tip: string
}

export default function UploadGuidance({ dimensions, format, tip }: UploadGuidanceProps) {
  return (
    <div className="mb-2 px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-xs leading-relaxed">
      <p className="text-gray-800">
        <span className="font-semibold text-orange-700">Recommended:</span>{' '}
        <span className="text-gray-700">{dimensions}</span>{' · '}
        <span className="text-gray-700">{format}</span>
      </p>
      <p className="text-gray-600 mt-0.5">{tip}</p>
    </div>
  )
}
