'use client';

import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

interface AnalysisResult {
  pageNumber: number;
  content: string;
  index: number;
}

// Dynamic import of the worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

type DocType = 'rawText' | 'arabicTranslate' | 'dataFields' | 'invoice' | 'contract' | 'certificate' | 'official' | 'summary' | 'research';

export default function Reader() {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedPages, setConvertedPages] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<DocType>('rawText');
  const [showPromptMenu, setShowPromptMenu] = useState<number | null>(null);
  const [readingView, setReadingView] = useState<{imageUrl: string, pageNumber: number} | null>(null);

  const promptOptions = {
    rawText: 'Extract Raw Text',
    arabicTranslate: 'Arabic Translation',
    summary: 'Text Summary',
    research: 'Research Paper Analysis',
    dataFields: 'General Data Fields',
    invoice: 'Invoice Analysis',
    contract: 'Contract Analysis',
    certificate: 'Certificate Details',
    official: 'Official Document'
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setError(null);
    setImages([]);
    setReadingView(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      const newImages: string[] = [];
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport: viewport
        }).promise;
        
        // Store image data URL
        const imageUrl = canvas.toDataURL('image/png');
        newImages.push(imageUrl);
      }
      
      setImages(newImages);
      setConvertedPages(totalPages);
    } catch (err) {
      setError('Error converting PDF to images: ' + (err as Error).message);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = async (imageUrl: string, pageNumber: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `page_${pageNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Error downloading image: ' + (error as Error).message);
    }
  };

  const openReadingView = (imageUrl: string, pageNumber: number) => {
    setReadingView({ imageUrl, pageNumber });
  };

  const closeReadingView = () => {
    setReadingView(null);
  };

  const navigateReadingView = (direction: 'prev' | 'next') => {
    if (!readingView) return;
    
    const currentIndex = readingView.pageNumber - 1;
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(images.length - 1, currentIndex + 1);
    
    if (newIndex !== currentIndex) {
      setReadingView({
        imageUrl: images[newIndex],
        pageNumber: newIndex + 1
      });
    }
  };

  const analyzeImage = async (imageUrl: string, index: number, promptType: DocType) => {
    try {
      setIsAnalyzing(index);
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: imageUrl,
          docType: promptType 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setAnalysisResults(prev => [...prev, {
        pageNumber: index + 1,
        content: data.analysis,
        index: prev.length
      }]);
    } catch (error) {
      setError('Error analyzing image: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const deleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setAnalysisResults(prev => prev.filter(result => result.pageNumber !== index + 1));
    if (readingView && readingView.pageNumber === index + 1) {
      setReadingView(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Analysis copied to clipboard!', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#10B981',
          color: 'white',
          padding: '12px 24px',
        },
      });
    } catch (_) {
      toast.error('Failed to copy text', {  
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  const deleteAnalysis = (index: number) => {
    setAnalysisResults(prev => prev.filter(result => result.index !== index));
  };

  const AnalysisResults = () => (
    <div className="mt-4 space-y-6">
      {analysisResults.map((result) => (
        <div key={result.index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Analysis Result - Page {result.pageNumber}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(result.content)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Copy analysis"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                  />
                </svg>
              </button>
              <button
                onClick={() => deleteAnalysis(result.index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-full transition-colors"
                title="Delete analysis"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                #{result.index + 1}
              </span>
            </div>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({children, ...props}) => <h1 className="text-xl font-bold my-4" {...props}>{children}</h1>,
                h2: ({children, ...props}) => <h2 className="text-lg font-semibold my-3" {...props}>{children}</h2>,
                h3: ({children, ...props}) => <h3 className="text-md font-medium my-2" {...props}>{children}</h3>,
                ul: ({children, ...props}) => <ul className="list-disc pl-4 my-2" {...props}>{children}</ul>,
                li: ({children, ...props}) => <li className="my-1" {...props}>{children}</li>,
                p: ({children, ...props}) => <p className="my-2" {...props}>{children}</p>,
                strong: ({children, ...props}) => <strong className="font-semibold" {...props}>{children}</strong>,
              }}
            >
              {result.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );

  // Reading View Modal
  const ReadingViewModal = () => {
    if (!readingView) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 modal-overlay">
        <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden modal-content">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Page {readingView.pageNumber} of {images.length}
            </h2>
            <button 
              onClick={closeReadingView}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="pdf-image-container">
              {/* 
                We need to use img instead of next/image because:
                1. We're using data URLs which Next Image doesn't support directly
                2. The dimensions are dynamic based on the PDF content
                3. We need to display content generated at runtime
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={readingView.imageUrl} 
                alt={`Page ${readingView.pageNumber}`}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={() => navigateReadingView('prev')}
              disabled={readingView.pageNumber <= 1}
              className={`px-4 py-2 rounded-lg ${
                readingView.pageNumber <= 1
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous Page
            </button>
            <button
              onClick={() => navigateReadingView('next')}
              disabled={readingView.pageNumber >= images.length}
              className={`px-4 py-2 rounded-lg ${
                readingView.pageNumber >= images.length
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              PDF Book Reader
            </Link>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with images */}
          <div className="w-64 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="mb-4 relative group">
                <button
                  onClick={() => deleteImage(index)}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                    flex items-center justify-center shadow-md hover:bg-red-600 z-10"
                  title="Delete image"
                >
                  ×
                </button>
                <div 
                  onClick={() => openReadingView(imageUrl, index + 1)}
                  className="cursor-pointer transition-all hover:shadow-xl relative page-thumbnail"
                >
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg"></div>
                  {/* 
                    We need to use img instead of next/image because:
                    1. These are data URLs from canvas.toDataURL() which Next Image doesn't support
                    2. The images are dynamically generated at runtime from PDF pages
                  */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrl} 
                    alt={`Page ${index + 1}`}
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Read Page
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={() => downloadImage(imageUrl, index + 1)}
                    className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300
                      hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
                  >
                    Download Page {index + 1}
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowPromptMenu(showPromptMenu === index ? null : index)}
                      className={`w-full px-4 py-2 text-sm relative
                        ${isAnalyzing === index 
                          ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'} 
                        rounded-md transition-colors disabled:opacity-50`}
                      disabled={isAnalyzing !== null}
                    >
                      {isAnalyzing === index ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⚡</span>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze as: {promptOptions[selectedPrompt]}
                          <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {showPromptMenu === index && !isAnalyzing && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                        {(Object.entries(promptOptions) as [DocType, string][]).map(([type, label]) => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedPrompt(type);
                              setShowPromptMenu(null);
                              analyzeImage(imageUrl, index, type);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 first:rounded-t-md last:rounded-b-md"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Smart PDF Reader</h1>
            
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload a PDF Document</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your PDF document to convert it to images and analyze its content using AI. Click on any page to open the reading view.
              </p>
              
              <div className="mb-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isConverting}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    dark:file:bg-violet-900 dark:file:text-violet-300
                    hover:file:bg-violet-100 dark:hover:file:bg-violet-800
                    cursor-pointer"
                />
              </div>

              {isConverting && (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting PDF to images...
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-md mt-4">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {convertedPages && !isConverting && (
                <div className="p-4 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-md mt-4">
                  Conversion complete! {convertedPages} pages converted. Click on any page to read or analyze its content.
                </div>
              )}
            </div>

            {analysisResults.length > 0 && <AnalysisResults />}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} PDF Book Reader. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Reading View Modal */}
      <ReadingViewModal />
      
      <Toaster />
    </>
  );
} 