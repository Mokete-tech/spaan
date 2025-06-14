
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface DocumentUploadStepProps {
  documents: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  documents,
  onFileChange,
  onRemoveFile,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Document Verification</h2>
        <p className="text-gray-600 mb-6">
          Upload documents to verify your identity and business registration
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Verification Documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            Accepted formats: PDF, JPG, PNG (Max 10MB each)
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Please upload one or more of the following documents:
          </p>
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            <li>• Government-issued ID (ID card, passport, driver's license)</li>
            <li>• Business registration certificate</li>
            <li>• Professional certification/license</li>
          </ul>
          <Input
            id="documents"
            type="file"
            onChange={onFileChange}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("documents")?.click()}
            className="mx-auto"
          >
            Select Files
          </Button>
        </div>
        
        {documents.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Documents:</h4>
            <ul className="space-y-2">
              {documents.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="bg-spaan-primary hover:bg-spaan-primary/90"
          disabled={documents.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
