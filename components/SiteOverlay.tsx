'use client'

export default function SiteOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Lanserar snart
        </h1>
        <p className="text-gray-600">
          Vi lanserar vår nya hemsida mycket snart. Välkommen tillbaka!
        </p>
      </div>
    </div>
  )
}