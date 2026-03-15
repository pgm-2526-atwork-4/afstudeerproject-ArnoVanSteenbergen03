export default function AdminDashSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 to-slate-100 p-6 pb-24">
      <div className="flex justify-center mb-12">
        <div className="text-center">
          <div className="h-10 bg-slate-300 rounded-lg w-48 mx-auto mb-4 animate-pulse"></div>
          <div className="h-1 bg-slate-300 w-40 mx-auto rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-full bg-white rounded-xl p-6 shadow-md border-2 border-slate-200 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-300 p-3 rounded-lg w-14 h-14"></div>
              </div>

              <div className="space-y-3">
                <div className="h-6 bg-slate-300 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>

              <div className="mt-4 h-4 bg-slate-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
