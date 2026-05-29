/**
 * Perfis de equipamento base do Brew Pilot.
 *
 * Cobrem todos os setupTypes e escalas:
 *  - Caseiro iniciante (10 L) → avançado (50 L)
 *  - Nano-brewery (100 L) → Micro-brewery artesanal (300 L)
 *
 * setupType:
 *   BIAB            – Panela Única (Bag In A Brew)
 *   TwoVessel       – Duas Panelas (Mash Tun + Kettle)
 *   ThreeVessel     – Três Panelas (HLT + Mash Tun + Kettle)
 *   Extract         – Extrato de malte (sem mostura)
 *   PartialMash     – Mostura parcial + extrato
 *   FermentedBeverage – Cidra, Hidromel, Vinho
 */

import type { EquipmentProfile } from '@/types/equipment'

// ── Labels de tipo para exibição ──────────────────────────────────────────────

export const SETUP_TYPE_LABELS: Record<string, string> = {
  BIAB:              'BIAB / Panela Única',
  TwoVessel:         '2 Panelas',
  ThreeVessel:       '3 Panelas',
  Extract:           'Extrato',
  PartialMash:       'Parcial',
  FermentedBeverage: 'Bebida Fermentada',
}

export const SETUP_TYPE_ICONS: Record<string, string> = {
  BIAB:              'mdi-kettle',
  TwoVessel:         'mdi-kettle-outline',
  ThreeVessel:       'mdi-server',
  Extract:           'mdi-flask-outline',
  PartialMash:       'mdi-flask-round-bottom-outline',
  FermentedBeverage: 'mdi-bottle-wine-outline',
}

// ── Perfis base ───────────────────────────────────────────────────────────────

export const BASE_EQUIPMENT_PROFILES: EquipmentProfile[] = [

  // ── BIAB / Panela Única ───────────────────────────────────────────────────
  // Processo: Mash + Fervura numa única panela com saco de mostura.
  // Mais popular no Brasil: simples, barato, alta qualidade.

  {
    id: 'base-biab-10l',
    name: 'BIAB Mini 10 L',
    setupType: 'BIAB',
    batchVolume: 10,
    preBoilVolume: 13.5,
    boilTime: 60,
    efficiency: 67,
    mashEfficiency: 72,
    boilOffRate: 2.5,
    trubLoss: 0.8,
    fermentorLoss: 0.5,
    deadSpace: 0,
    mashTunVolume: 18,
    boilTemperature: 100,
    lauterMethod: 'NoSparge',
    bagSqueeze: true,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Panela de 14-20 L com saco de mostura. Ideal para testes de receitas, primeiras brassagens e espaços pequenos. ' +
      'Espremer o saco aumenta o rendimento em ~3-5%. Resfrie com chiller de imersão pequeno.',
  },

  {
    id: 'base-biab-20l',
    name: 'BIAB Padrão 20 L',
    setupType: 'BIAB',
    batchVolume: 20,
    preBoilVolume: 26,
    boilTime: 60,
    efficiency: 70,
    mashEfficiency: 75,
    boilOffRate: 4,
    trubLoss: 1.5,
    fermentorLoss: 0.8,
    deadSpace: 0,
    mashTunVolume: 35,
    boilTemperature: 100,
    lauterMethod: 'NoSparge',
    bagSqueeze: true,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'O setup BIAB mais popular no Brasil. Panela de 30-40 L com saco de poliéster. ' +
      'Transferir para fermentador após resfriamento com chiller de imersão. ' +
      'Espremer o saco bem reduz a absorção e aumenta o rendimento.',
  },

  {
    id: 'base-biab-30l',
    name: 'BIAB Avançado 30 L',
    setupType: 'BIAB',
    batchVolume: 30,
    preBoilVolume: 40,
    boilTime: 60,
    efficiency: 72,
    mashEfficiency: 76,
    boilOffRate: 5.5,
    trubLoss: 2,
    fermentorLoss: 1.2,
    deadSpace: 0,
    mashTunVolume: 50,
    boilTemperature: 100,
    lauterMethod: 'NoSparge',
    bagSqueeze: true,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'BIAB em panela de 50 L. Setup para cervejeiros com mais experiência que produzem para eventos e amigos. ' +
      'Requer suporte para suspender o saco ou uma prensa de fácil construção.',
  },

  {
    id: 'base-biab-50l',
    name: 'BIAB Semi-Pro 50 L',
    setupType: 'BIAB',
    batchVolume: 50,
    preBoilVolume: 65,
    boilTime: 60,
    efficiency: 72,
    mashEfficiency: 75,
    boilOffRate: 8,
    trubLoss: 3,
    fermentorLoss: 2,
    deadSpace: 0,
    mashTunVolume: 80,
    boilTemperature: 100,
    lauterMethod: 'NoSparge',
    bagSqueeze: true,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'BIAB de grande porte em panela de 80-100 L. Requer sistema de elevação do saco (polia ou guincho). ' +
      'Chiller de imersão maior ou chiller de contrafluxo recomendado.',
  },

  // ── Two Vessel / Duas Panelas ─────────────────────────────────────────────
  // Processo: Caixa de mostura (cooler ou panela) + panela de fervura separada.
  // All-grain clássico com maior controle de temperatura da mostura.

  {
    id: 'base-twovessel-20l',
    name: '2 Panelas Padrão 20 L',
    setupType: 'TwoVessel',
    batchVolume: 20,
    preBoilVolume: 26,
    boilTime: 60,
    efficiency: 72,
    mashEfficiency: 78,
    boilOffRate: 3.5,
    trubLoss: 2,
    fermentorLoss: 0.8,
    deadSpace: 1,
    mashTunVolume: 30,
    boilTemperature: 100,
    lauterMethod: 'BatchSparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'Caixa de isopor/cooler de 30-40 L como mash tun + panela de fervura. ' +
      'Batch sparge: adicionar toda a água de lavagem de uma vez. Cervejeiro all-grain clássico.',
  },

  {
    id: 'base-twovessel-30l',
    name: '2 Panelas Avançado 30 L',
    setupType: 'TwoVessel',
    batchVolume: 30,
    preBoilVolume: 39,
    boilTime: 60,
    efficiency: 74,
    mashEfficiency: 80,
    boilOffRate: 5,
    trubLoss: 2.5,
    fermentorLoss: 1.2,
    deadSpace: 1.5,
    mashTunVolume: 45,
    boilTemperature: 100,
    lauterMethod: 'BatchSparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      '30 L com caixa de mostura de 45 L + panela de 50 L. ' +
      'Setup versátil para cervejeiros que querem escalar a produção sem automação.',
  },

  {
    id: 'base-twovessel-50l',
    name: '2 Panelas Semi-Pro 50 L',
    setupType: 'TwoVessel',
    batchVolume: 50,
    preBoilVolume: 64,
    boilTime: 60,
    efficiency: 75,
    mashEfficiency: 81,
    boilOffRate: 7,
    trubLoss: 4,
    fermentorLoss: 1.25,
    deadSpace: 2,
    mashTunVolume: 70,
    boilTemperature: 100,
    lauterMethod: 'BatchSparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Conical',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Duas panelas de aço inox 70 L + 80 L. Cervejeiro semi-profissional ou homebrewer avançado com produção para eventos.',
  },

  // ── Three Vessel / Três Panelas ───────────────────────────────────────────
  // Processo: HLT (água quente) + Mash Tun + Kettle (fervura).
  // Máximo controle, usado por cervejarias artesanais e homebrewers avançados.

  {
    id: 'base-threevessel-20l',
    name: '3 Panelas Caseiro 20 L',
    setupType: 'ThreeVessel',
    batchVolume: 20,
    preBoilVolume: 26,
    boilTime: 60,
    efficiency: 75,
    mashEfficiency: 82,
    boilOffRate: 3.5,
    trubLoss: 2,
    fermentorLoss: 0.5,
    deadSpace: 1.5,
    mashTunVolume: 30,
    hltVolume: 40,
    boilTemperature: 100,
    lauterMethod: 'BatchSparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Conical',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'HLT 40 L + Mash Tun 30 L + Kettle 40 L. Setup completo all-grain caseiro com controle total de temperatura de mostura e espargimento.',
  },

  {
    id: 'base-threevessel-50l',
    name: '3 Panelas Automático 50 L',
    setupType: 'ThreeVessel',
    batchVolume: 50,
    preBoilVolume: 63,
    boilTime: 60,
    efficiency: 78,
    mashEfficiency: 84,
    boilOffRate: 7,
    trubLoss: 3.5,
    fermentorLoss: 1.25,
    deadSpace: 2,
    mashTunVolume: 70,
    hltVolume: 80,
    boilTemperature: 100,
    lauterMethod: 'FlySparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Conical',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'Setup automático de 50 L com controle elétrico (tipo Biermaker 50L, Speidel Braumeister 50L). ' +
      'Fly sparge contínuo para maior eficiência de extração.',
  },

  {
    id: 'base-threevessel-100l',
    name: 'Nano-Brewery 100 L',
    setupType: 'ThreeVessel',
    batchVolume: 100,
    preBoilVolume: 121,
    boilTime: 90,
    efficiency: 78,
    mashEfficiency: 84,
    boilOffRate: 10,
    trubLoss: 8,
    fermentorLoss: 1.5,
    deadSpace: 3,
    mashTunVolume: 150,
    hltVolume: 180,
    boilTemperature: 100,
    lauterMethod: 'FlySparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Unitank',
    hopUtilization: 100,
    grainAbsorptionRate: 0.75,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'Nano-cervejaria 100 L. Três vasos de inox com aquecimento a gás ou elétrico. ' +
      'Fly sparge para máxima extração. Resfriamento por chiller de placa. ' +
      'Batelada de 100 L rende ~90-95 garrafas 1 L.',
  },

  {
    id: 'base-threevessel-300l',
    name: 'Micro-Brewery 300 L',
    setupType: 'ThreeVessel',
    batchVolume: 300,
    preBoilVolume: 357,
    boilTime: 90,
    efficiency: 80,
    mashEfficiency: 85,
    boilOffRate: 25,
    trubLoss: 20,
    fermentorLoss: 4.5,
    deadSpace: 8,
    mashTunVolume: 450,
    hltVolume: 500,
    boilTemperature: 100,
    lauterMethod: 'FlySparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Unitank',
    hopUtilization: 100,
    grainAbsorptionRate: 0.75,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'Cervejaria artesanal de pequeno porte. Batelada de 300 L para produção semi-comercial em barris ou garrafas. ' +
      'Resfriamento obrigatório por trocador de calor de placa.',
  },

  {
    id: 'base-threevessel-500l',
    name: 'Cervejaria Artesanal 500 L',
    setupType: 'ThreeVessel',
    batchVolume: 500,
    preBoilVolume: 593,
    boilTime: 90,
    efficiency: 82,
    mashEfficiency: 87,
    boilOffRate: 40,
    trubLoss: 30,
    fermentorLoss: 7.5,
    deadSpace: 12,
    mashTunVolume: 750,
    hltVolume: 800,
    boilTemperature: 100,
    lauterMethod: 'FlySparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Unitank',
    hopUtilization: 100,
    grainAbsorptionRate: 0.75,
    calculateBoilVolume: true,
    calculateMashEfficiency: true,
    isDefault: true,
    notes:
      'Cervejaria artesanal média. 500 L por batelada — típico de brewpubs e pequenas cervejarias artesanais brasileiras. ' +
      'Sistema com CIP (Clean In Place) e controle automatizado de temperatura recomendados.',
  },

  // ── Extract / Extrato ─────────────────────────────────────────────────────
  // Processo: Apenas fervura com extrato de malte líquido (LME) ou seco (DME).
  // Sem mostura. Ideal para iniciantes ou receitas rápidas.

  {
    id: 'base-extract-10l',
    name: 'Extrato Iniciante 10 L',
    setupType: 'Extract',
    batchVolume: 10,
    preBoilVolume: 12.5,
    boilTime: 30,
    efficiency: 100,
    mashEfficiency: 100,
    boilOffRate: 2,
    trubLoss: 0.8,
    fermentorLoss: 0.5,
    deadSpace: 0,
    mashTunVolume: 0,
    boilTemperature: 100,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Kit iniciante com extrato de malte. Panela de 15-20 L, sem mostura. ' +
      'Fervura de 30 min para esterilização e isomerização dos lúpulos. ' +
      'Perfeito para quem está começando a fazer cerveja em casa.',
  },

  {
    id: 'base-extract-20l',
    name: 'Extrato Padrão 20 L',
    setupType: 'Extract',
    batchVolume: 20,
    preBoilVolume: 25,
    boilTime: 60,
    efficiency: 100,
    mashEfficiency: 100,
    boilOffRate: 4,
    trubLoss: 1.5,
    fermentorLoss: 0.8,
    deadSpace: 0,
    mashTunVolume: 0,
    boilTemperature: 100,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Cerveja de extrato 20 L. Simples, rápido (2-3h no dia de brassagem) e sem necessidade de equipamento de mostura. ' +
      'Ótima opção para receitas de trigo, IPA e estilos fáceis de alta fermentação.',
  },

  // ── Partial Mash / Mostura Parcial ────────────────────────────────────────
  // Processo: Pequena mostura (specialties) + complemento com extrato.
  // Transição entre extrato puro e all-grain.

  {
    id: 'base-partialmash-20l',
    name: 'Parcial Mash 20 L',
    setupType: 'PartialMash',
    batchVolume: 20,
    preBoilVolume: 26,
    boilTime: 60,
    efficiency: 65,
    mashEfficiency: 70,
    boilOffRate: 4,
    trubLoss: 1.5,
    fermentorLoss: 0.8,
    deadSpace: 0.5,
    mashTunVolume: 15,
    boilTemperature: 100,
    lauterMethod: 'NoSparge',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 100,
    grainAbsorptionRate: 0.8,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Mostura parcial: 1-2 kg de malte especial em saco numa panela menor + extrato de malte para completar a densidade. ' +
      'Ótimo passo intermediário entre extrato puro e all-grain. Permite usar maltes caramelo, torrado e fumaçado.',
  },

  // ── Fermented Beverage / Bebidas Fermentadas ──────────────────────────────
  // Cidra, Hidromel, Vinho, Kefir de fruta.
  // Geralmente sem fervura ou com pasteurização suave.

  {
    id: 'base-fermbev-cider-20l',
    name: 'Cidra / Vinho 20 L',
    setupType: 'FermentedBeverage',
    batchVolume: 20,
    preBoilVolume: 20,
    boilTime: 0,
    efficiency: 100,
    mashEfficiency: 100,
    boilOffRate: 0,
    trubLoss: 0.5,
    fermentorLoss: 0.8,
    deadSpace: 0,
    mashTunVolume: 0,
    boilTemperature: 20,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 0,
    isDefault: true,
    notes:
      'Cidra de maçã ou vinho artesanal sem fervura. Volume calculado direto no fermentador. ' +
      'Higienização com metabissulfito de potássio. Opcional: pasteurizar a 60-65°C por 30 min antes de fermentar.',
  },

  {
    id: 'base-fermbev-mead-20l',
    name: 'Hidromel 20 L',
    setupType: 'FermentedBeverage',
    batchVolume: 20,
    preBoilVolume: 22,
    boilTime: 15,
    efficiency: 100,
    mashEfficiency: 100,
    boilOffRate: 0.8,
    trubLoss: 0.3,
    fermentorLoss: 0.8,
    deadSpace: 0,
    mashTunVolume: 0,
    boilTemperature: 77,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    hopUtilization: 0,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Hidromel tradicional (Mead). Pasteurização suave a 77°C por 15 min — não ferva, pois destroi aromas e enzimas do mel. ' +
      'Resfrie rapidamente antes de adicionar a levedura. Fermentação lenta: 2-6 semanas.',
  },

  {
    id: 'base-fermbev-mead-50l',
    name: 'Hidromel Artesanal 50 L',
    setupType: 'FermentedBeverage',
    batchVolume: 50,
    preBoilVolume: 54,
    boilTime: 15,
    efficiency: 100,
    mashEfficiency: 100,
    boilOffRate: 2,
    trubLoss: 0.8,
    fermentorLoss: 1.25,
    deadSpace: 0,
    mashTunVolume: 0,
    boilTemperature: 77,
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'Conical',
    hopUtilization: 0,
    calculateBoilVolume: true,
    isDefault: true,
    notes:
      'Hidromel de escala semi-artesanal. 50 L por batelada — ideal para produção para feiras e eventos. ' +
      'Requer bomba de transferência para o fermentador.',
  },
]
