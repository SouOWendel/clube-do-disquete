import { NomeIcone } from '../../../shared/ui/icone/icone';

/** Icone de cada categoria fixa (database/002_create_schema.sql), como no Figma. */
const ICONES: Record<string, NomeIcone> = {
  'precos-e-promocoes': 'tag',
  'combos-cpu-gpu': 'combo',
  'montagem-e-upgrade': 'chave',
  'conserto-e-diagnostico': 'estetoscopio',
  'placas-de-video': 'monitor',
  processadores: 'chip',
};

export function iconeDaCategoria(codigo: string | null | undefined): NomeIcone {
  if (!codigo) return 'grade';
  return ICONES[codigo] ?? 'tag';
}
