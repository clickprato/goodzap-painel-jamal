import { useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CampaignImageUploadProps {
  label: string;
  /** Nome base do arquivo (sem extensão), ex: "imagem_promocao_ativa" */
  fileName: string;
  url: string | null;
  ativa: boolean;
  onChange: (next: { url: string | null; ativa: boolean }) => void;
}

const BUCKET = "imagens_campanhas";

export const CampaignImageUpload = ({
  label,
  fileName,
  url,
  ativa,
  onChange,
}: CampaignImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione um arquivo de imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${fileName}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      // Cache-bust para refletir nova versão
      const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

      onChange({ url: publicUrl, ativa });
      toast({ title: "Imagem enviada!", description: "Lembre-se de salvar a campanha." });
    } catch (err: any) {
      toast({
        title: "Erro no upload",
        description: err?.message || "Falha ao enviar imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange({ url: null, ativa });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Label className="flex items-center gap-2 font-medium">
          <ImageIcon className="h-4 w-4 text-accent" />
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Enviar Imagem</span>
          <Switch
            checked={ativa}
            onCheckedChange={(checked) => onChange({ url, ativa: checked })}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {url ? "Trocar imagem" : "Selecionar imagem"}
        </Button>
        {url && (
          <Button type="button" size="sm" variant="ghost" onClick={handleRemove}>
            <X className="h-4 w-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      {url && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-md border border-border/50 bg-background/40">
            <img
              src={url}
              alt={label}
              className="max-h-48 w-auto object-contain mx-auto"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Link da imagem</Label>
            <Input
              readOnly
              value={url}
              className="bg-muted/40 text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignImageUpload;
