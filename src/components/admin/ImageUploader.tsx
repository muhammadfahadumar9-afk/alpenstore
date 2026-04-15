import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentUrl: string | null;
  onImageChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
}

export default function ImageUploader({ currentUrl, onImageChange, bucket = 'page-images', folder = 'uploads' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    onImageChange(urlData.publicUrl);
    toast.success('Image uploaded');
    setUploading(false);

    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemove = async () => {
    if (currentUrl) {
      // Try to extract path from URL to delete from storage
      try {
        const url = new URL(currentUrl);
        const pathParts = url.pathname.split(`/object/public/${bucket}/`);
        if (pathParts[1]) {
          await supabase.storage.from(bucket).remove([decodeURIComponent(pathParts[1])]);
        }
      } catch {
        // If URL parsing fails, just clear the reference
      }
    }
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      {currentUrl ? (
        <div className="relative inline-block">
          <img
            src={currentUrl}
            alt="Preview"
            className="w-full max-w-[200px] h-32 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full max-w-[200px] h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Click to upload</span>
            </>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
