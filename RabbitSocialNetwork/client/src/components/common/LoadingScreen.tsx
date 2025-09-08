export default function LoadingScreen() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="animate-pulse">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-primary"
          >
            <path d="M6 12a.75.75 0 01-.75-.75v-7.5a.75.75 0 111.5 0v7.5A.75.75 0 016 12zM18 12a.75.75 0 01-.75-.75v-7.5a.75.75 0 011.5 0v7.5A.75.75 0 0118 12zM6.75 20.25v-1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0zM18.75 18.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 011.5 0zM12.75 5.25v-1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0zM12 21a.75.75 0 01-.75-.75v-7.5a.75.75 0 011.5 0v7.5A.75.75 0 0112 21zM3.75 15a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zM12 11.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM15.75 15a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0z" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2">Working on your content</h2>
      
      <div className="mb-6 text-gray-600 text-center">
        <p>Crafting personalized content tailored to your preferences...</p>
      </div>
      
      <div className="w-full max-w-xs bg-gray-100 rounded-full h-2.5 mb-6">
        <div className="bg-primary h-2.5 rounded-full w-3/4 animate-[progress_1.5s_ease-in-out_infinite]"></div>
      </div>
      
      <div className="text-sm text-gray-500">This may take a few moments</div>
    </div>
  );
}