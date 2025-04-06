import React, { useState } from 'react';
import axios from 'axios';

const Traceability = () => {
  const [requirements, setRequirements] = useState<File | null>(null);
  const [code, setCode] = useState<File | null>(null);
  const [testCases, setTestCases] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnalysisResult(null);

    if (!requirements || !code || !testCases) {
      setError('Please upload all required files.');
      return;
    }

    const formData = new FormData();
    formData.append('requirements', requirements);
    formData.append('code', code);
    formData.append('test_cases', testCases);

    try {
      const response = await axios.post('http://127.0.0.1:5001/trace', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data); // Log the response to verify its structure
      setAnalysisResult(JSON.stringify(response.data, null, 2)); // Format the response as a JSON string
    } catch (err) {
      setError('An error occurred while analyzing the files.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Traceability Analysis</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Requirements (PDF):</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, setRequirements)}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Code (JavaScript/TypeScript):</label>
          <input
            type="file"
            accept=".js,.ts"
            onChange={(e) => handleFileChange(e, setCode)}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Test Cases (JSON):</label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFileChange(e, setTestCases)}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Analyze
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 text-center font-medium">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="mt-6 bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Result</h2>
          <pre className="whitespace-pre-wrap break-words text-gray-700">
            {analysisResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Traceability;