'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-3">
            Smart PDF Book Reader
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enjoy your books with a clean, elegant reading experience and AI-powered analysis
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-64 h-80 shadow-2xl transform transition-transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <h3 className="text-xl font-bold mb-2">AI-Powered Reading</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analyze document content with AI</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Advanced PDF Reader</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload your PDF files, navigate page by page, and analyze content with AI assistance.
              </p>
              <Link 
                href="/reader" 
                className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Reader
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Features</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Page-by-page navigation
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  AI-powered content analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Download page images
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Multiple analysis modes
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Dark mode support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Smart PDF Book Reader. All rights reserved.</p>
      </footer>
    </main>
  );
}
