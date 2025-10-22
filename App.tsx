
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Loader } from './components/Loader';
import type { BillItem } from './types';
import { generateBillOfMaterials } from './services/geminiService';
import { RocketLaunchIcon } from './components/icons/RocketLaunchIcon';

const App: React.FC = () => {
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [billOfMaterials, setBillOfMaterials] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [planPreview, setPlanPreview] = useState<string | null>(null);

  const handlePlanFileChange = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setPlanFile(file);
      setError(null);
      setBillOfMaterials([]);

      // Generate preview
      if (file.type === 'application/pdf') {
        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                if (e.target?.result) {
                    const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
                    const pdf = await (window as any).pdfjsLib.getDocument({ data: typedarray }).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context!, viewport: viewport }).promise;
                    setPlanPreview(canvas.toDataURL());
                }
            };
            fileReader.readAsArrayBuffer(file);
        } catch (err) {
            console.error("Failed to generate PDF preview:", err);
            setPlanPreview(null);
            setError("Could not generate a preview for this PDF.");
        }
      } else {
        setPlanPreview(URL.createObjectURL(file));
      }

    } else {
      setPlanFile(null);
      setPlanPreview(null);
    }
  }, []);

  const handleKnowledgeFilesChange = useCallback((files: FileList | null) => {
    if (files) {
      setKnowledgeFiles(Array.from(files));
    } else {
      setKnowledgeFiles([]);
    }
  }, []);

  const handleGenerate = async () => {
    if (!planFile) {
      setError('Please upload a plan file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBillOfMaterials([]);
    setAnalysisLog(['Starting analysis...']);

    try {
      const results = await generateBillOfMaterials(
        planFile,
        knowledgeFiles,
        (logMessage) => {
          setAnalysisLog((prev) => [...prev, logMessage]);
        }
      );
      setBillOfMaterials(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Paso 1: Subir Plano</h2>
              <p className="text-sm text-slate-400 mb-4">
                Sube el plano del proyecto en formato PDF. La IA analizará la primera página.
              </p>
              <FileUpload
                id="plan-upload"
                onFileChange={handlePlanFileChange}
                accept=".pdf"
                label="Seleccionar archivo PDF del plano..."
              />
               {planPreview && (
                <div className="mt-4 p-2 border border-slate-600 rounded-lg bg-slate-900">
                    <p className="text-sm font-semibold mb-2 text-slate-300">Vista Previa del Plano:</p>
                    <img src={planPreview} alt="Plan preview" className="rounded-md max-h-60 w-auto mx-auto" />
                </div>
              )}
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Paso 2: Subir Base de Conocimiento (Opcional)</h2>
              <p className="text-sm text-slate-400 mb-4">
                Proporciona presupuestos, diagramas o esquemas de proyectos anteriores para entrenar a la IA y mejorar la precisión. Se recomiendan imágenes (.png, .jpg).
              </p>
              <FileUpload
                id="knowledge-upload"
                onFileChange={handleKnowledgeFilesChange}
                multiple
                accept="image/png, image/jpeg, image/webp"
                label={`(${knowledgeFiles.length}) archivos de conocimiento seleccionados...`}
              />
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={handleGenerate}
                disabled={!planFile || isLoading}
                className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-900/50"
              >
                <RocketLaunchIcon />
                {isLoading ? 'Analizando con IA...' : 'Generar Catálogo de Conceptos'}
              </button>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
          </div>

          {/* Right Column: Outputs */}
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Resultados del Análisis</h2>
            {isLoading ? (
              <Loader log={analysisLog} />
            ) : billOfMaterials.length > 0 ? (
              <ResultsTable data={billOfMaterials} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <div className="p-6 bg-slate-800 rounded-full mb-4">
                    <RocketLaunchIcon className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Esperando análisis</h3>
                <p className="max-w-sm">Los resultados del catálogo de conceptos aparecerán aquí una vez que la IA complete el análisis del plano.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
