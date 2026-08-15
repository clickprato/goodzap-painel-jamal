import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, BookOpen, Cpu, ArrowRight } from "lucide-react";
import { manualSections } from "@/data/manualContent";
import { toast } from "sonner";

const sectionOrder = [
  "geral",
  "dashboard",
  "empresa",
  "configuracoes",
  "campanhas",
  "cardapio",
  "relatorios",
  "metricas",
  "clientes",
  "pedidos",
  "horarios",
  "reservas",
];

const Manual = () => {
  const handleDownloadPdf = async () => {
    toast.info("Gerando PDF...");
    
    const content = sectionOrder
      .map((key) => {
        const section = manualSections[key];
        if (!section) return "";
        let text = `\n${"=".repeat(60)}\n${section.title}\n${section.subtitle}\n${"=".repeat(60)}\n\n`;
        section.blocks.forEach((block) => {
          if (block.heading) text += `--- ${block.heading} ---\n`;
          text += `${block.text}\n\n`;
        });
        return text;
      })
      .join("\n");

    const fullText = `MANUAL DO PAINEL DE COMANDO - GOODZAP\n${"=".repeat(60)}\nGerado em: ${new Date().toLocaleDateString("pt-BR")}\n\n${content}`;

    // Create downloadable text file (works without extra libs)
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Manual_GoodZap_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Manual baixado com sucesso!");
  };

  const geralSection = manualSections["geral"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="neon-text-cyan">Manual</span>
          </h2>
          <p className="text-muted-foreground">Guia completo de uso do painel de comando</p>
        </div>
        <Button onClick={handleDownloadPdf} className="neon-glow-cyan">
          <Download className="h-4 w-4 mr-2" />
          Baixar Manual
        </Button>
      </div>

      {/* Intro card */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Como funciona o GoodZap?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {geralSection?.blocks.slice(0, 3).map((block, i) => (
            <div key={i}>
              {block.heading && <h3 className="font-semibold text-primary mb-1 text-sm">{block.heading}</h3>}
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{block.text}</p>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">Painel</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">n8n</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-accent/20 text-accent border-accent/30">Agente IA</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-primary/20 text-primary border-primary/30">WhatsApp</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sections accordion */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Seções do Painel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {sectionOrder
              .filter((key) => key !== "geral")
              .map((key) => {
                const section = manualSections[key];
                if (!section) return null;
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="hover:text-primary">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pl-2">
                        <p className="text-xs text-muted-foreground italic">{section.subtitle}</p>
                        {section.blocks.map((block, i) => (
                          <div key={i}>
                            {block.heading && (
                              <h4 className={`font-medium text-sm mb-1 ${block.heading.includes("🤖") ? "text-primary" : "text-foreground"}`}>
                                {block.heading}
                              </h4>
                            )}
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{block.text}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-primary/30">
        <CardContent className="pt-6">
          <div className="space-y-2">
            {geralSection?.blocks
              .filter((b) => b.heading === "Dicas importantes")
              .map((block, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{block.text}</p>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Manual;
