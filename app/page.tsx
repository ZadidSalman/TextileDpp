'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useSpring } from 'motion/react';
import Image from 'next/image';
import { 
  CheckCircle2, Download, Share, ShieldCheck, AlertCircle, User, 
  Droplets, Zap, Trash2, Box, Wind, Sun, Recycle, Leaf,
  X, ChevronLeft, ChevronRight, Ruler, Maximize2, Sparkles, Layers,
  TrendingDown, Scale, Car, Smartphone, TreePine, ArrowDownRight
} from 'lucide-react';

type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';
type Unit = 'cm' | 'in';
type Garment = 'top' | 'bottom';
type StyleType = 'uni' | 'aop';

const EU: Record<Size, string> = {S:'44/46',M:'48/50',L:'52/54',XL:'56/58',XXL:'60/62'};
const ART: Record<StyleType, Record<Size, string>> = {
  uni:{S:'730801',M:'730798',L:'730802',XL:'730799',XXL:'730800'},
  aop:{S:'730793',M:'730794',L:'730796',XL:'730797',XXL:'730795'}
};
const FIT = {
  top: <>Relaxed loungewear block: <b>short-sleeve V-neck</b> with self-fabric piping, necktape chain-stitched at back, shoulder seam moved ~2 cm forward. Allowed dimensional change after wash: <b>±4%</b>.</>,
  bottom: <>Straight-leg shorts with <b>set-on waistband</b> (drawstring + elastic inside), side pockets and fake fly. Waistband stretches from 48/50 39 cm relaxed to 50 cm. Allowed change after wash: <b>±4%</b>.</>
};

interface MeasurementDef {
  k: string;
  name: string;
  how: string;
  vals: Record<Size, number>;
  g: string;
  guide: string;
}

const TOP_MEASUREMENTS: MeasurementDef[] = [
  {k:'A',name:'1/2 Chest',how:'2 cm below armhole · tol ±1 cm',vals:{S:50,M:54,L:58,XL:62,XXL:66},g:'g-t-chest',guide:'Lay garment flat. Measure horizontally 2 cm below armhole seams straight across.'},
  {k:'B',name:'Back Length',how:'from HSP (High Shoulder Point) · tol ±1 cm',vals:{S:73,M:75,L:77,XL:79,XXL:81},g:'g-t-len',guide:'Measure vertically from the highest shoulder point at neckline down to the bottom hem.'},
  {k:'C',name:'Sleeve Length',how:'along sleeve fold · tol ±1 cm',vals:{S:21,M:22,L:23,XL:24,XXL:25},g:'g-t-sleeve',guide:'Measure along outer fold from shoulder seam down to the sleeve cuff opening.'},
  {k:'D',name:'Shoulder Width',how:'outer points straight · tol ±1 cm',vals:{S:46,M:48,L:50,XL:52,XXL:54},g:'g-t-shoulder',guide:'Measure straight across from one shoulder seam point to the opposite shoulder seam point.'},
  {k:'E',name:'Armhole Depth',how:'straight at right angle · tol ±0.5 cm',vals:{S:23,M:24,L:25,XL:26,XXL:27},g:'g-t-armhole',guide:'Measure straight at a 90° angle from the outer shoulder point down to the armpit curve.'}
];

const BOTTOM_MEASUREMENTS: MeasurementDef[] = [
  {k:'A',name:'1/2 Waistband',how:'straight along edge · tol ±1 cm',vals:{S:36,M:39,L:42,XL:45,XXL:48},g:'g-b-waist',guide:'Measure straight along the top edge of the set-on waistband with elastic relaxed.'},
  {k:'B',name:'1/2 Hip Width',how:'at hip height · tol ±1 cm',vals:{S:51,M:54,L:57,XL:60,XXL:63},g:'g-b-hip',guide:'Measure horizontally across widest part of hip line (~18-20 cm below waistband).'},
  {k:'C',name:'Inseam Length',how:'along inner leg seam · tol ±1 cm',vals:{S:14,M:15,L:16,XL:17,XXL:18},g:'g-b-inseam',guide:'Measure along inside seam from crotch junction down to the bottom leg hem.'},
  {k:'D',name:'Front Rise',how:'incl. waistband to crotch · tol ±1 cm',vals:{S:29,M:30,L:31,XL:32,XXL:33},g:'g-b-rise',guide:'Measure vertically from top edge of front waistband straight down to crotch seam.'},
  {k:'E',name:'Leg Opening',how:'along bottom hem · tol ±0.5 cm',vals:{S:29,M:31,L:33,XL:35,XXL:37},g:'g-b-leg',guide:'Measure straight across the bottom leg hem opening from side seam to inseam.'}
];

function GarmentMapSvg({
  garment,
  activeKey,
  onSelectKey,
  isMini = false
}: {
  garment: Garment;
  activeKey: string | null;
  onSelectKey?: (key: string) => void;
  isMini?: boolean;
}) {
  const isTop = garment === 'top';

  return (
    <div className={`relative w-full ${isMini ? 'max-w-[180px] mx-auto' : 'max-w-full'}`}>
      <svg 
        className="w-full h-auto drop-shadow-sm select-none" 
        viewBox="0 0 220 240" 
        aria-label={`${garment} measurement diagram`}
      >
        <defs>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-lime" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {isTop ? (
          /* TOP GARMENT SCHEMATIC */
          <g>
            {/* Base Garment Shape */}
            <path 
              className="fill-green-soft/80 stroke-green stroke-[2px] transition-all" 
              d="M70 30 L96 24 L110 48 L124 24 L150 30 L186 82 L158 100 L148 86 L148 208 L72 208 L72 86 L62 100 L34 82 Z"
            />
            {/* V-neck collar */}
            <path className="fill-none stroke-green stroke-[2px]" d="M96 24 L110 48 L124 24" />
            {/* Back Neck tape */}
            <path className="fill-none stroke-green/40 stroke-[1.5px] stroke-dasharray-[2_2]" d="M96 24 C102 28 118 28 124 24" />
            {/* Shoulder Seams */}
            <line x1="70" y1="30" x2="96" y2="24" className="stroke-green/50 stroke-[1.2px]" />
            <line x1="150" y1="30" x2="124" y2="24" className="stroke-green/50 stroke-[1.2px]" />
            {/* Hem stitch */}
            <line x1="72" y1="202" x2="148" y2="202" className="stroke-green/40 stroke-[1px] stroke-dasharray-[3_2]" />
            <line x1="38" y1="86" x2="58" y2="98" className="stroke-green/40 stroke-[1px] stroke-dasharray-[3_2]" />
            <line x1="182" y1="86" x2="162" y2="98" className="stroke-green/40 stroke-[1px] stroke-dasharray-[3_2]" />

            {/* A: 1/2 CHEST */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('A')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'A' || activeKey === 'g-t-chest'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="72" y1="120" x2="148" y2="120"
                filter={activeKey === 'A' || activeKey === 'g-t-chest' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'A' || activeKey === 'g-t-chest' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="72" y1="113" x2="72" y2="127" />
              <line className={`transition-all ${activeKey === 'A' || activeKey === 'g-t-chest' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="148" y1="113" x2="148" y2="127" />
              <circle cx="110" cy="120" r={activeKey === 'A' || activeKey === 'g-t-chest' ? "10" : "8"} className={`transition-all ${activeKey === 'A' || activeKey === 'g-t-chest' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="110" cy="120" x="110" y="123" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'A' || activeKey === 'g-t-chest' ? 'fill-lime' : 'fill-green-dark'}`}>A</text>
              {!isMini && (
                <text x="110" y="110" textAnchor="middle" className={`font-mono text-[8.5px] font-bold tracking-wider transition-colors ${activeKey === 'A' || activeKey === 'g-t-chest' ? 'fill-ink font-bold' : 'fill-muted'}`}>1/2 CHEST</text>
              )}
            </g>

            {/* B: BACK LENGTH */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('B')}
            >
              {/* Projection guide lines */}
              <line x1="124" y1="24" x2="198" y2="24" className="stroke-[#8A988D]/40 stroke-[1px] stroke-dasharray-[2_2]" />
              <line x1="148" y1="208" x2="198" y2="208" className="stroke-[#8A988D]/40 stroke-[1px] stroke-dasharray-[2_2]" />
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'B' || activeKey === 'g-t-len'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="198" y1="24" x2="198" y2="208"
                filter={activeKey === 'B' || activeKey === 'g-t-len' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'B' || activeKey === 'g-t-len' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="192" y1="24" x2="204" y2="24" />
              <line className={`transition-all ${activeKey === 'B' || activeKey === 'g-t-len' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="192" y1="208" x2="204" y2="208" />
              <circle cx="198" cy="116" r={activeKey === 'B' || activeKey === 'g-t-len' ? "10" : "8"} className={`transition-all ${activeKey === 'B' || activeKey === 'g-t-len' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="198" cy="116" x="198" y="119" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'B' || activeKey === 'g-t-len' ? 'fill-lime' : 'fill-green-dark'}`}>B</text>
              {!isMini && (
                <text x="198" y="222" textAnchor="middle" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'B' || activeKey === 'g-t-len' ? 'fill-ink' : 'fill-muted'}`}>LENGTH</text>
              )}
            </g>

            {/* C: SLEEVE */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('C')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'C' || activeKey === 'g-t-sleeve'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="68" y1="36" x2="38" y2="80"
                filter={activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="63" y1="32" x2="73" y2="40" />
              <line className={`transition-all ${activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="33" y1="76" x2="43" y2="84" />
              <circle cx="53" cy="58" r={activeKey === 'C' || activeKey === 'g-t-sleeve' ? "10" : "8"} className={`transition-all ${activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="53" cy="58" x="53" y="61" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'fill-lime' : 'fill-green-dark'}`}>C</text>
              {!isMini && (
                <text x="24" y="60" textAnchor="middle" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'C' || activeKey === 'g-t-sleeve' ? 'fill-ink' : 'fill-muted'}`}>SLEEVE</text>
              )}
            </g>

            {/* D: SHOULDER */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('D')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'D' || activeKey === 'g-t-shoulder'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="70" y1="28" x2="150" y2="28"
                filter={activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="70" y1="22" x2="70" y2="34" />
              <line className={`transition-all ${activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="150" y1="22" x2="150" y2="34" />
              <circle cx="110" cy="20" r={activeKey === 'D' || activeKey === 'g-t-shoulder' ? "10" : "8"} className={`transition-all ${activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="110" cy="20" x="110" y="23" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'fill-lime' : 'fill-green-dark'}`}>D</text>
              {!isMini && (
                <text x="110" y="10" textAnchor="middle" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'D' || activeKey === 'g-t-shoulder' ? 'fill-ink' : 'fill-muted'}`}>SHOULDER</text>
              )}
            </g>

            {/* E: ARMHOLE */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('E')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'E' || activeKey === 'g-t-armhole'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="150" y1="30" x2="148" y2="86"
                filter={activeKey === 'E' || activeKey === 'g-t-armhole' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'E' || activeKey === 'g-t-armhole' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="144" y1="30" x2="156" y2="30" />
              <line className={`transition-all ${activeKey === 'E' || activeKey === 'g-t-armhole' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="142" y1="86" x2="154" y2="86" />
              <circle cx="160" cy="58" r={activeKey === 'E' || activeKey === 'g-t-armhole' ? "10" : "8"} className={`transition-all ${activeKey === 'E' || activeKey === 'g-t-armhole' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="160" cy="58" x="160" y="61" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'E' || activeKey === 'g-t-armhole' ? 'fill-lime' : 'fill-green-dark'}`}>E</text>
              {!isMini && (
                <text x="186" y="60" textAnchor="start" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'E' || activeKey === 'g-t-armhole' ? 'fill-ink' : 'fill-muted'}`}>ARMHOLE</text>
              )}
            </g>
          </g>
        ) : (
          /* BOTTOM GARMENT SCHEMATIC */
          <g>
            {/* Waistband */}
            <rect className="fill-green-soft stroke-green stroke-[2px]" x="62" y="44" width="96" height="14" rx="2" />
            {/* Shorts body */}
            <path 
              className="fill-green-soft/80 stroke-green stroke-[2px]" 
              d="M62 58 L158 58 L168 96 L172 158 L126 158 L113 112 L107 112 L94 158 L48 158 L52 96 Z"
            />
            {/* Drawstring and fake fly details */}
            <line x1="110" y1="58" x2="110" y2="88" className="stroke-green stroke-[1.8px]" />
            <path d="M106 58 C102 68 100 78 104 84" className="fill-none stroke-green stroke-[1.5px]" />
            <path d="M114 58 C118 68 120 78 116 84" className="fill-none stroke-green stroke-[1.5px]" />
            {/* Side Pockets */}
            <line x1="68" y1="58" x2="56" y2="86" className="stroke-green/50 stroke-[1.2px]" />
            <line x1="152" y1="58" x2="164" y2="86" className="stroke-green/50 stroke-[1.2px]" />
            {/* Leg hem stitch lines */}
            <line x1="48" y1="152" x2="94" y2="152" className="stroke-green/40 stroke-[1px] stroke-dasharray-[3_2]" />
            <line x1="126" y1="152" x2="172" y2="152" className="stroke-green/40 stroke-[1px] stroke-dasharray-[3_2]" />

            {/* A: 1/2 WAISTBAND */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('A')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'A' || activeKey === 'g-b-waist'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="62" y1="51" x2="158" y2="51"
                filter={activeKey === 'A' || activeKey === 'g-b-waist' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'A' || activeKey === 'g-b-waist' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="62" y1="44" x2="62" y2="58" />
              <line className={`transition-all ${activeKey === 'A' || activeKey === 'g-b-waist' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="158" y1="44" x2="158" y2="58" />
              <circle cx="110" cy="51" r={activeKey === 'A' || activeKey === 'g-b-waist' ? "10" : "8"} className={`transition-all ${activeKey === 'A' || activeKey === 'g-b-waist' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="110" cy="51" x="110" y="54" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'A' || activeKey === 'g-b-waist' ? 'fill-lime' : 'fill-green-dark'}`}>A</text>
              {!isMini && (
                <text x="110" y="36" textAnchor="middle" className={`font-mono text-[8.5px] font-bold tracking-wider transition-colors ${activeKey === 'A' || activeKey === 'g-b-waist' ? 'fill-ink' : 'fill-muted'}`}>1/2 WAISTBAND</text>
              )}
            </g>

            {/* B: 1/2 HIP */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('B')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'B' || activeKey === 'g-b-hip'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="53" y1="96" x2="167" y2="96"
                filter={activeKey === 'B' || activeKey === 'g-b-hip' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'B' || activeKey === 'g-b-hip' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="53" y1="89" x2="53" y2="103" />
              <line className={`transition-all ${activeKey === 'B' || activeKey === 'g-b-hip' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="167" y1="89" x2="167" y2="103" />
              <circle cx="110" cy="96" r={activeKey === 'B' || activeKey === 'g-b-hip' ? "10" : "8"} className={`transition-all ${activeKey === 'B' || activeKey === 'g-b-hip' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="110" cy="96" x="110" y="99" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'B' || activeKey === 'g-b-hip' ? 'fill-lime' : 'fill-green-dark'}`}>B</text>
              {!isMini && (
                <text x="110" y="86" textAnchor="middle" className={`font-mono text-[8.5px] font-bold tracking-wider transition-colors ${activeKey === 'B' || activeKey === 'g-b-hip' ? 'fill-ink' : 'fill-muted'}`}>1/2 HIP</text>
              )}
            </g>

            {/* C: INSEAM */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('C')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'C' || activeKey === 'g-b-inseam'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="107" y1="112" x2="94" y2="158"
                filter={activeKey === 'C' || activeKey === 'g-b-inseam' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'C' || activeKey === 'g-b-inseam' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="102" y1="108" x2="112" y2="116" />
              <line className={`transition-all ${activeKey === 'C' || activeKey === 'g-b-inseam' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="89" y1="154" x2="99" y2="162" />
              <circle cx="99" cy="135" r={activeKey === 'C' || activeKey === 'g-b-inseam' ? "10" : "8"} className={`transition-all ${activeKey === 'C' || activeKey === 'g-b-inseam' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="99" cy="135" x="99" y="138" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'C' || activeKey === 'g-b-inseam' ? 'fill-lime' : 'fill-green-dark'}`}>C</text>
              {!isMini && (
                <text x="66" y="140" textAnchor="middle" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'C' || activeKey === 'g-b-inseam' ? 'fill-ink' : 'fill-muted'}`}>INSEAM</text>
              )}
            </g>

            {/* D: FRONT RISE */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('D')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'D' || activeKey === 'g-b-rise'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="110" y1="44" x2="110" y2="112"
                filter={activeKey === 'D' || activeKey === 'g-b-rise' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'D' || activeKey === 'g-b-rise' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="104" y1="44" x2="116" y2="44" />
              <line className={`transition-all ${activeKey === 'D' || activeKey === 'g-b-rise' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="104" y1="112" x2="116" y2="112" />
              <circle cx="124" cy="74" r={activeKey === 'D' || activeKey === 'g-b-rise' ? "10" : "8"} className={`transition-all ${activeKey === 'D' || activeKey === 'g-b-rise' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="124" cy="74" x="124" y="77" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'D' || activeKey === 'g-b-rise' ? 'fill-lime' : 'fill-green-dark'}`}>D</text>
              {!isMini && (
                <text x="146" y="76" textAnchor="start" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'D' || activeKey === 'g-b-rise' ? 'fill-ink' : 'fill-muted'}`}>FRONT RISE</text>
              )}
            </g>

            {/* E: LEG OPENING */}
            <g 
              className="cursor-pointer group" 
              onClick={() => onSelectKey && onSelectKey('E')}
            >
              <line 
                className={`transition-all duration-300 ${
                  activeKey === 'E' || activeKey === 'g-b-leg'
                    ? 'stroke-green stroke-[3px]' 
                    : 'stroke-[#8A988D] group-hover:stroke-green stroke-[1.8px] stroke-dasharray-[5_3]'
                }`} 
                x1="126" y1="158" x2="172" y2="158"
                filter={activeKey === 'E' || activeKey === 'g-b-leg' ? 'url(#glow-green)' : undefined}
              />
              <line className={`transition-all ${activeKey === 'E' || activeKey === 'g-b-leg' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="126" y1="152" x2="126" y2="164" />
              <line className={`transition-all ${activeKey === 'E' || activeKey === 'g-b-leg' ? 'stroke-green stroke-[3px]' : 'stroke-[#8A988D] stroke-[1.8px]'}`} x1="172" y1="152" x2="172" y2="164" />
              <circle cx="149" cy="158" r={activeKey === 'E' || activeKey === 'g-b-leg' ? "10" : "8"} className={`transition-all ${activeKey === 'E' || activeKey === 'g-b-leg' ? 'fill-ink stroke-lime stroke-2' : 'fill-white stroke-green stroke-[1.5px] group-hover:fill-green-soft'}`} />
              <text cx="149" cy="158" x="149" y="161" textAnchor="middle" className={`font-mono text-[9px] font-bold ${activeKey === 'E' || activeKey === 'g-b-leg' ? 'fill-lime' : 'fill-green-dark'}`}>E</text>
              {!isMini && (
                <text x="149" y="174" textAnchor="middle" className={`font-mono text-[8px] font-bold tracking-wider transition-colors ${activeKey === 'E' || activeKey === 'g-b-leg' ? 'fill-ink' : 'fill-muted'}`}>LEG OPENING</text>
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

function QRCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    function hashSeed(s: string) {
      let h = 1779033703;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
      }
      return h >>> 0;
    }
    function mulberry(a: number) {
      return function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const N = 23, m = cv.width / N;
    const rnd = mulberry(hashSeed('151546-4300085070'));
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#17201B';
    
    function finder(fx: number, fy: number) {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const e = (x === 0 || x === 6 || y === 0 || y === 6);
          const c = (x > 1 && x < 5 && y > 1 && y < 5);
          if (e || c) ctx!.fillRect((fx + x) * m, (fy + y) * m, m * 0.92, m * 0.92);
        }
      }
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
        if (!inF && rnd() > 0.52) ctx.fillRect(x * m, y * m, m * 0.92, m * 0.92);
      }
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  }, []);

  return <canvas ref={canvasRef} width={92} height={92} className="rounded-lg border border-line bg-white" />;
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  scale?: boolean;
}

function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.65,
  scale = false,
}: RevealProps) {
  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: 22, x: 0 };
      case 'down': return { y: -22, x: 0 };
      case 'left': return { x: 24, y: 0 };
      case 'right': return { x: -24, y: 0 };
      case 'none': return { x: 0, y: 0 };
      default: return { y: 22, x: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        scale: scale ? 0.97 : 1,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: '-40px', amount: 0.12 }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CircularComposition({ cotton, modal, elastane }: { cotton: number, modal: number, elastane: number }) {
  const data = [
    { label: 'Cotton', value: cotton, color: 'var(--color-green)' },
    { label: 'Modal', value: modal, color: '#8FB79E' },
    { label: 'Elastane', value: elastane, color: '#C9B27E' },
  ];

  let cumulativeValue = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-3">
      <div className="relative w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F8F3" strokeWidth="12" />
          {data.map((item, i) => {
            const strokeDasharray = 2 * Math.PI * 40;
            const strokeDashoffset = strokeDasharray - (item.value / 100) * strokeDasharray;
            const rotation = (cumulativeValue / 100) * 360;
            cumulativeValue += item.value;

            return (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: strokeDasharray }}
                whileInView={{ strokeDashoffset }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: "circOut" }}
                strokeLinecap="round"
                style={{ transformOrigin: '50% 50%', transform: `rotate(${rotation}deg)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-widest text-muted font-bold">Total</span>
          <span className="text-[20px] sm:text-[24px] font-display font-bold text-ink">100%</span>
        </div>
      </div>

      <div className="grid gap-2.5 w-full">
        {data.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3 bg-surface-2 border border-line rounded-xl p-2.5 px-3.5 transition-transform hover:translate-x-1"
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[13px] font-bold text-ink flex-1">{item.label}</span>
            <span className="font-mono text-[13px] font-bold text-green-dark bg-green-soft px-2 py-0.5 rounded-lg">{item.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CarbonPieChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = [
    { label: 'Raw Materials', value: 35, kg: '1.68 kg', color: '#1B4D3E', note: 'CmiA rain-fed cotton & Birla modal' },
    { label: 'Manufacturing', value: 40, kg: '1.92 kg', color: '#4E8765', note: 'Low-liquor dyeing & knitting mills' },
    { label: 'Transport', value: 10, kg: '0.48 kg', color: '#C89D2B', note: 'Optimized ocean freight & central hub' },
    { label: 'Use Phase', value: 10, kg: '0.48 kg', color: '#D97706', note: 'Consumer 30°C eco-wash cycle' },
    { label: 'End of Life', value: 5, kg: '0.24 kg', color: '#718078', note: 'Textile recycling & biodegradation' },
  ];

  let cumulativeValue = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-7 py-4">
      {/* SVG Donut / Pie Chart with Entrance Animation */}
      <div className="relative w-[190px] h-[190px] lg:w-[220px] lg:h-[220px] shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none overflow-visible">
          {/* Subtle background track */}
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#E9F1EB" strokeWidth="18" />

          {data.map((item, i) => {
            const strokeDasharray = circumference;
            const strokeDashoffset = strokeDasharray - (item.value / 100) * strokeDasharray;
            const rotation = (cumulativeValue / 100) * 360;
            cumulativeValue += item.value;
            const isHovered = hoveredIdx === i;
            const isAnyHovered = hoveredIdx !== null;

            return (
              <motion.circle
                key={item.label}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? 21 : 18}
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: strokeDasharray, opacity: 0 }}
                whileInView={{ strokeDashoffset, opacity: isAnyHovered && !isHovered ? 0.45 : 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  strokeDashoffset: { duration: 1.3, delay: 0.15 + i * 0.14, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.4, delay: 0.1 + i * 0.14 },
                  strokeWidth: { duration: 0.25, ease: "easeOut" }
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${rotation}deg)`,
                  cursor: 'pointer',
                  filter: isHovered ? 'drop-shadow(0px 2px 6px rgba(0,0,0,0.18))' : 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Dynamic Center Badge */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.4 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2"
        >
          {activeItem ? (
            <motion.div
              key={activeItem.label}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span className="text-[9.5px] uppercase tracking-wider font-mono font-bold text-muted truncate max-w-[120px]">
                {activeItem.label}
              </span>
              <span className="text-[20px] lg:text-[22px] font-mono font-bold text-ink leading-tight">
                {activeItem.value}%
              </span>
              <span className="text-[10px] font-mono font-bold text-green-dark bg-green-soft px-1.5 py-0.2 rounded mt-0.5">
                {activeItem.kg}
              </span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] uppercase tracking-widest text-muted font-bold">Total CO₂e</span>
              <span className="text-[24px] lg:text-[26px] font-display font-bold text-ink leading-tight">4.8kg</span>
              <span className="text-[9.5px] font-mono text-green-dark font-medium mt-0.5">Grade A LCA</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Segment Legend & Percentage Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 w-full">
        {data.map((item, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.08, ease: "easeOut" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center gap-3 border rounded-xl p-2 px-3 transition-all cursor-pointer ${
                isHovered
                  ? 'bg-green-soft/80 border-green shadow-sm translate-x-1' 
                  : 'bg-surface-2 border-line hover:border-line-2 hover:bg-surface'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                style={{
                  backgroundColor: item.color,
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[12px] font-bold text-ink truncate">{item.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10.5px] font-mono text-muted">{item.kg}</span>
                    <span className="text-[11.5px] font-mono font-bold text-ink bg-white/80 px-1.5 py-0.2 rounded border border-line">
                      {item.value}%
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-muted/15 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Compact Industry Benchmark Comparison Bar inside the Carbon card */}
        <div className="mt-0.5 pt-2 border-t border-line/60 bg-white border border-line rounded-xl p-2.5 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-[11px] mb-1.5 font-medium">
            <span className="text-ink font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green inline-block" />
              4.8 kg CO₂e (This Product)
            </span>
            <span className="text-green-dark font-mono font-bold bg-green-soft px-1.5 py-0.5 rounded border border-[#BCD8C6]">
              -58% vs Industry Avg (11.5 kg)
            </span>
          </div>
          <div className="relative h-2 bg-amber-100/70 border border-amber-200/60 rounded-full overflow-hidden flex items-center">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '41.7%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "circOut", delay: 0.6 }}
              className="h-full bg-green rounded-full shadow-sm relative z-10"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted font-mono mt-1">
            <span className="text-green-dark font-bold">4.8 kg · CmiA/Modal Set</span>
            <span>11.5 kg · Conventional Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceBarChart() {
  const data = [
    { label: 'Water Usage', value: 420, max: 1500, unit: 'L', icon: Droplets, color: 'var(--color-green)', sub: 'vs 1,500L standard' },
    { label: 'Renewable Energy', value: 65, max: 100, unit: '%', icon: Zap, color: '#D4AF37', sub: 'Target: 80% by 2026' },
    { label: 'Recycled Content', value: 95, max: 100, unit: '%', icon: Recycle, color: '#5FA47F', sub: 'Post-consumer waste' },
  ];

  return (
    <div className="grid gap-6 py-4">
      {data.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-surface-2 border border-line rounded-xl p-5 group hover:border-green transition-all"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-line grid place-items-center text-muted group-hover:text-ink transition-colors">
                <item.icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-ink leading-none">{item.label}</h4>
                <p className="text-[11px] text-muted mt-1.5 font-medium">{item.sub}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display font-bold text-[22px] text-ink">{item.value}<small className="text-[13px] ml-0.5">{item.unit}</small></span>
            </div>
          </div>
          
          <div className="relative h-2.5 bg-muted/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / item.max) * 100}%` }}
              transition={{ duration: 1.5, delay: 0.3, ease: "circOut" }}
              className="h-full rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}


function CarbonBenchmarkScale() {
  const [activeTab, setActiveTab] = useState<'scale' | 'drivers' | 'equivalents'>('scale');
  const productCO2 = 4.8;
  const industryCO2 = 11.5;
  const highCarbonCO2 = 15.8;
  const maxScale = 18;
  
  const productPos = (productCO2 / maxScale) * 100;
  const industryPos = (industryCO2 / maxScale) * 100;
  const highPos = (highCarbonCO2 / maxScale) * 100;
  const deltaSavings = (industryCO2 - productCO2).toFixed(1);
  const percentSavings = Math.round(((industryCO2 - productCO2) / industryCO2) * 100);

  return (
    <div className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-soft text-green-dark border border-[#BCD8C6] grid place-items-center shrink-0">
            <Scale size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-ink">CO₂e Footprint Benchmark Scale</h3>
              <span className="bg-green-soft border border-[#BCD8C6] text-green-dark text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full">
                -{percentSavings}% Impact
              </span>
            </div>
            <p className="text-[12.5px] text-muted mt-0.5">
              Comparing this 2-piece set against the conventional sleepwear industry average
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-surface-2 border border-line rounded-full p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('scale')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'scale' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            Visual Scale
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'drivers' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            Key Drivers
          </button>
          <button
            onClick={() => setActiveTab('equivalents')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'equivalents' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            Equivalencies
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="pt-6">
        {activeTab === 'scale' && (
          <div className="space-y-6">
            {/* Visual Gauge Track Bar */}
            <div className="bg-surface-2 border border-line rounded-2xl p-5 sm:p-6">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted mb-3 font-medium">
                <span>0 kg (Zero Target)</span>
                <span className="text-green-dark font-bold">ECO TIER (&lt;6kg)</span>
                <span className="text-amber-700 font-bold">STANDARD (6-12kg)</span>
                <span className="text-muted/80">INTENSIVE (&gt;12kg)</span>
                <span>18 kg CO₂e</span>
              </div>

              {/* Bar track */}
              <div className="relative h-7 rounded-xl overflow-visible flex items-center shadow-inner border border-line/80 bg-gradient-to-r from-emerald-100 via-amber-50 to-rose-100">
                {/* Zone dividing lines */}
                <div className="absolute top-0 bottom-0 left-[33.3%] w-[1px] bg-line/60 border-dashed" />
                <div className="absolute top-0 bottom-0 left-[66.6%] w-[1px] bg-line/60 border-dashed" />

                {/* Savings span highlight between 4.8kg and 11.5kg */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${industryPos - productPos}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{ left: `${productPos}%` }}
                  className="absolute top-1 bottom-1 bg-green/20 border border-green/40 rounded-md pointer-events-none"
                />

                {/* Pointer 1: This Product (4.8 kg) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
                  style={{ left: `${productPos}%` }}
                  className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center z-20 group cursor-default"
                >
                  <div className="bg-ink text-lime border-2 border-lime px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
                    <span>{productCO2} kg</span>
                    <span className="text-[9px] bg-white/15 px-1 rounded text-white font-sans">Tchibo Set</span>
                  </div>
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-ink" />
                  <div className="w-3.5 h-3.5 rounded-full bg-lime border-2 border-ink shadow-md mt-1" />
                </motion.div>

                {/* Pointer 2: Industry Average (11.5 kg) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.5 }}
                  style={{ left: `${industryPos}%` }}
                  className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center z-10 group cursor-default"
                >
                  <div className="bg-surface border border-line-2 text-ink px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <span>{industryCO2} kg</span>
                    <span className="text-[9px] text-muted font-sans">Industry Avg</span>
                  </div>
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-line-2" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#8A988D] border-2 border-white shadow-md mt-1" />
                </motion.div>

                {/* Marker 3: High Carbon Benchmark (15.8 kg) */}
                <div
                  style={{ left: `${highPos}%` }}
                  className="absolute -bottom-8 -translate-x-1/2 flex flex-col items-center pointer-events-none hidden sm:flex"
                >
                  <div className="w-[1px] h-3 bg-muted/40" />
                  <span className="text-[9.5px] font-mono text-muted/70 whitespace-nowrap">
                    {highCarbonCO2}kg (Fast Fashion)
                  </span>
                </div>
              </div>

              {/* Scale annotation footer */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-line/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-soft text-green-dark grid place-items-center">
                    <TrendingDown size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-bold text-ink">
                    Avoided Emissions: <span className="text-green-dark font-mono font-bold">-{deltaSavings} kg CO₂e</span> per unit
                  </span>
                </div>
                <div className="text-[11.5px] font-mono text-muted">
                  Benchmarked against Euratex & Textile Exchange LCA Datasets (2024/2025)
                </div>
              </div>
            </div>

            {/* Side-by-side comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tchibo Garment Card */}
              <div className="bg-green-soft/40 border-2 border-green/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-0.5 rounded-md uppercase">
                      This Product
                    </span>
                    <span className="font-mono font-bold text-[20px] text-green-dark">4.8 kg CO₂e</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ink">Tchibo Men&apos;s 2-Piece Pyjamas</h4>
                  <ul className="mt-3 space-y-1.5 text-[12px] text-ink/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green shrink-0" />
                      <span><b>Cotton made in Africa (CmiA):</b> Rain-fed, 0 irrigation electricity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green shrink-0" />
                      <span><b>Birla Excel Modal:</b> Closed-loop chemical recovery &gt;99%</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green shrink-0" />
                      <span><b>Supply Chain:</b> Solar-supported knit & OEKO-TEX certified wet finishing</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-green/20 flex items-center justify-between text-[11.5px] text-green-dark font-semibold">
                  <span>Carbon Rating: Grade A</span>
                  <span className="font-mono">-58.3% vs Avg</span>
                </div>
              </div>

              {/* Conventional Industry Card */}
              <div className="bg-surface-2 border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-muted bg-white border border-line px-2 py-0.5 rounded-md uppercase">
                      Industry Baseline
                    </span>
                    <span className="font-mono font-bold text-[20px] text-ink">{industryCO2} kg CO₂e</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ink">Conventional Pyjama Set Equivalent</h4>
                  <ul className="mt-3 space-y-1.5 text-[12px] text-muted">
                    <li className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-line-2 text-muted text-[10px] grid place-items-center font-mono">✕</span>
                      <span><b>Conventional Cotton:</b> Intensive diesel pump irrigation & synthetic fertilisers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-line-2 text-muted text-[10px] grid place-items-center font-mono">✕</span>
                      <span><b>Generic Viscose/Polyester:</b> High sulfur emissions & open effluent discharge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-line-2 text-muted text-[10px] grid place-items-center font-mono">✕</span>
                      <span><b>Coal-heavy grid:</b> Thermal electricity used in yarn spinning and fabric wash</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11.5px] text-muted font-medium">
                  <span>Carbon Rating: Grade D</span>
                  <span className="font-mono text-ink font-bold">+6.7 kg CO₂e Burden</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-2 border border-line rounded-xl p-4.5">
              <div className="w-8 h-8 rounded-lg bg-green-soft text-green-dark grid place-items-center font-bold text-[13px] mb-2.5">
                -40%
              </div>
              <h4 className="text-[13.5px] font-bold text-ink">CmiA Raw Cotton Origin</h4>
              <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                100% rain-fed African smallholder cultivation eliminates diesel-powered aquifer pumping and minimizes chemical pesticide emissions.
              </p>
            </div>

            <div className="bg-surface-2 border border-line rounded-xl p-4.5">
              <div className="w-8 h-8 rounded-lg bg-green-soft text-green-dark grid place-items-center font-bold text-[13px] mb-2.5">
                -60%
              </div>
              <h4 className="text-[13.5px] font-bold text-ink">Closed-Loop Modal Fiber</h4>
              <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                Birla Excel Edelweiss solvent-spun process recycles &gt;99% of process chemicals and co-generates biogenic process heat on site.
              </p>
            </div>

            <div className="bg-surface-2 border border-line rounded-xl p-4.5">
              <div className="w-8 h-8 rounded-lg bg-green-soft text-green-dark grid place-items-center font-bold text-[13px] mb-2.5">
                -35%
              </div>
              <h4 className="text-[13.5px] font-bold text-ink">Low-Liquor Ratio Dyeing</h4>
              <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                Cold-pad-batch reactive dyeing in compliant facilities dramatically reduces thermal steam energy requirements per kilogram of finished fabric.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'equivalents' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-soft/50 border border-[#BCD8C6] rounded-xl flex items-center justify-between flex-wrap gap-2">
              <span className="text-[13px] font-bold text-green-dark">
                What does saving 6.7 kg CO₂e per pyjama set mean in practice?
              </span>
              <span className="text-[11.5px] font-mono font-bold bg-white text-green-dark px-2.5 py-1 rounded-full border border-[#BCD8C6]">
                Single Garment Impact
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface-2 border border-line rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-2">
                  <Car size={16} />
                </div>
                <div className="font-mono text-[18px] font-bold text-ink">27.8 km</div>
                <div className="text-[11px] text-muted mt-0.5">Passenger car driving avoided</div>
              </div>

              <div className="bg-surface-2 border border-line rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-2">
                  <Smartphone size={16} />
                </div>
                <div className="font-mono text-[18px] font-bold text-ink">815</div>
                <div className="text-[11px] text-muted mt-0.5">Smartphones fully charged</div>
              </div>

              <div className="bg-surface-2 border border-line rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-2">
                  <TreePine size={16} />
                </div>
                <div className="font-mono text-[18px] font-bold text-ink">0.31</div>
                <div className="text-[11px] text-muted mt-0.5">Tree seedlings grown for 10 yrs</div>
              </div>

              <div className="bg-surface-2 border border-line rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-2">
                  <Droplets size={16} />
                </div>
                <div className="font-mono text-[18px] font-bold text-ink">1,080 L</div>
                <div className="text-[11px] text-muted mt-0.5">Freshwater conserved</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RevealGroup({ 
  children, 
  className = '', 
  stagger = 0.09, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px', amount: 0.08 }}
      variants={{
        visible: { 
          transition: { 
            staggerChildren: stagger,
            delayChildren: delay,
          } 
        },
        hidden: {}
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({ 
  children, 
  className = '',
  direction = 'up',
  scale = false,
}: { 
  children: React.ReactNode; 
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  scale?: boolean;
}) {
  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: 20, x: 0 };
      case 'down': return { y: -20, x: 0 };
      case 'left': return { x: 20, y: 0 };
      case 'right': return { x: -20, y: 0 };
      case 'none': return { x: 0, y: 0 };
      default: return { y: 20, x: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          x: offset.x, 
          y: offset.y,
          scale: scale ? 0.97 : 1 
        },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          scale: 1, 
          transition: { 
            duration: 0.55, 
            ease: [0.21, 0.47, 0.32, 0.98] 
          } 
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PulseMarker({ top, left }: { top: string, left: string }) {
  return (
    <div 
      className="absolute w-3 h-3 bg-green rounded-full z-10" 
      style={{ top, left }}
    >
      <motion.div 
        animate={{ 
          scale: [1, 2.5],
          opacity: [0.7, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
        className="absolute inset-0 bg-green rounded-full"
      />
      <div className="absolute inset-[3px] bg-white rounded-full shadow-sm" />
    </div>
  );
}

function OriginMap() {
  return (
    <div className="relative bg-[#EAE6DA] border border-line rounded-[18px] overflow-hidden mb-6 shadow-custom aspect-[1/1] sm:aspect-[21/9]">
      <Image 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAROjOi-Bf2EcETjYQMYUiQFiGvpbNnne4KfaHBiXJYvdh3thocx7W06GEve67XMqCacKpZItN7RPP7TRmKEsKIPbkMSJD3aREJ794POQ-yTiMDoJgxsFCVToMqjCwI9jrej_9nVi_8NCHh4soGenyWEdF31wyv2Dw0rljUeY_oGR1uumoaX9IXdst2MPeKmJD46dZwGzKn-G1DSTtHqDlUgAQN7zhLnpoa7LCJ8hW2awbgSxx_n0J"
        alt="Supply Chain Route Map"
        fill
        className="object-cover opacity-85 mix-blend-multiply"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/20 to-transparent" />
      
      {/* Route Markers based on the dummy journey */}
      <PulseMarker top="45%" left="75%" /> {/* Bangladesh / India region */}
      <PulseMarker top="38%" left="52%" /> {/* Turkey region */}
      <PulseMarker top="42%" left="44%" /> {/* Portugal region */}
      <PulseMarker top="35%" left="41%" /> {/* Germany/Hamburg region */}
      
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-5 bg-white/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-line shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green rounded-full pulse-marker-simple" />
          <span className="text-[9px] sm:text-[11px] font-bold text-ink uppercase tracking-wider">Live Route</span>
        </div>
      </div>
    </div>
  );
}

function TraceBar() {
  const [pct, setPct] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  
  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / 1400, 1);
        setPct(Math.round(87 * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] sm:px-[26px] mb-[30px] flex gap-[26px] items-center flex-wrap">
      <div className="font-display font-bold text-[40px] text-green leading-none">
        {pct}<small className="text-[18px] text-muted">%</small>
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className="h-2.5 bg-[#EAE6DA] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={isInView ? { width: '87%' } : { width: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-green to-[#5FA47F] rounded-full"
          />
        </div>
        <div className="text-[12px] text-muted mt-2">
          Traceability completeness — 13 of 15 data points verified · <span className="text-amber font-semibold">2 pending (farm-level cotton origin, elastane polymer origin)</span>
        </div>
      </div>
    </div>
  );
}

function LabCard({ std, title, val, subVal, desc, hint }: any) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="p-5 cursor-pointer transition-transform duration-300 text-left border border-line rounded-[16px] bg-white shadow-custom hover:-translate-y-1">
      <div className="flex justify-between items-center mb-2.5 gap-2">
        <span className="font-mono text-[10px] text-muted">{std}</span>
        <span className="text-[10.5px] font-bold tracking-widest bg-green-soft text-green-dark border border-[#BCD8C6] rounded-full px-2.5 py-[3px] whitespace-nowrap">PASS</span>
      </div>
      <h4 className="text-[13px] font-bold mb-1.5">{title}</h4>
      <div className="font-display font-bold text-[23px] tracking-tight">
        {val} <small className="text-[12px] text-muted font-medium">{subVal}</small>
      </div>
      <motion.div 
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0, marginTop: open ? 10 : 0 }}
        className="overflow-hidden text-[12px] text-muted"
      >
        <div className="border-t border-dashed border-line-2 pt-2.5">
          {desc}
        </div>
      </motion.div>
      <div className="text-[10.5px] text-line-2 mt-2">{hint}</div>
    </button>
  );
}

function AccordionItem({ num, title, text, isOpen, onClick }: any) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button onClick={onClick} className="w-full flex items-center gap-3.5 bg-transparent border-none py-[13px] px-1 text-left cursor-pointer">
        <span className={`w-7 h-7 shrink-0 rounded-full font-mono text-[12px] flex items-center justify-center font-medium transition-colors duration-250 ${isOpen ? 'bg-green text-white' : 'bg-green-soft text-green-dark'}`}>
          {num}
        </span>
        <span className="font-semibold text-[13.5px] flex-1">{title}</span>
        <span className={`transition-transform duration-300 text-muted ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="text-[12.5px] text-muted px-1 pb-3.5 pl-[46px]">{text}</p>
      </motion.div>
    </div>
  )
}

const SECTIONS = [
  { id: 'section-a', label: 'Overview', letter: 'A' },
  { id: 'section-b', label: 'Traceability', letter: 'B' },
  { id: 'section-c', label: 'Quality', letter: 'C' },
  { id: 'section-d', label: 'Care', letter: 'D' },
  { id: 'section-e', label: 'Circularity', letter: 'E' },
  { id: 'section-f', label: 'Impact', letter: 'F' },
  { id: 'section-g', label: 'Data', letter: 'G' },
];

export default function Page() {
  const [curSize, setCurSize] = useState<Size>('M');
  const [curUnit, setCurUnit] = useState<Unit>('cm');
  const [curGar, setCurGar] = useState<Garment>('top');
  const [curStyle, setCurStyle] = useState<StyleType>('uni');
  const [curView, setCurView] = useState('cw1');
  
  const [hoveredGar, setHoveredGar] = useState<string | null>(null);
  const [selectedMeasurementKey, setSelectedMeasurementKey] = useState<string | null>('A');
  const [showMiniOverlay, setShowMiniOverlay] = useState(false);

  const [stainTab, setStainTab] = useState('oil');
  const [accOpen, setAccOpen] = useState<number | null>(1);
  const [toast, setToast] = useState(false);
  const [locResult, setLocResult] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('section-a');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  const isManualScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const activeMeasurementList = curGar === 'top' ? TOP_MEASUREMENTS : BOTTOM_MEASUREMENTS;
  const currentActiveDef = activeMeasurementList.find(m => m.k === (selectedMeasurementKey || 'A')) || activeMeasurementList[0];

  const handleSelectMeasurement = (key: string) => {
    setSelectedMeasurementKey(key);
    const found = activeMeasurementList.find(m => m.k === key);
    if (found) {
      setHoveredGar(found.g);
    }
    setShowMiniOverlay(true);
  };

  const handleNextMeasurement = () => {
    const currentIndex = activeMeasurementList.findIndex(m => m.k === currentActiveDef.k);
    const nextIndex = (currentIndex + 1) % activeMeasurementList.length;
    handleSelectMeasurement(activeMeasurementList[nextIndex].k);
  };

  const handlePrevMeasurement = () => {
    const currentIndex = activeMeasurementList.findIndex(m => m.k === currentActiveDef.k);
    const prevIndex = (currentIndex - 1 + activeMeasurementList.length) % activeMeasurementList.length;
    handleSelectMeasurement(activeMeasurementList[prevIndex].k);
  };

  // Auto-detect active section on vertical scroll (ScrollSpy)
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const scrollPosition = window.scrollY + 180;
      
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top - 40) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure the active tab button is smoothly visible in horizontal overflow on small screens
  useEffect(() => {
    const activeBtn = document.getElementById(`tab-btn-${activeSection}`);
    if (activeBtn && tabNavRef.current) {
      const container = tabNavRef.current;
      const tabLeft = activeBtn.offsetLeft;
      const tabWidth = activeBtn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      isManualScrolling.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const headerOffset = 115;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrolling.current = false;
      }, 700);
    }
  };

  const fmt = (v: number) => curUnit === 'cm' ? v.toFixed(1) + ' cm' : (v / 2.54).toFixed(1) + ' in';

  const handleCopy = () => {
    const artNo = ART[curStyle][curSize];
    if (navigator.clipboard) navigator.clipboard.writeText(artNo);
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  const handleLocSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    const q = input.value.trim();
    if (!q) return;
    
    // Hash function for random centers
    let h = 1779033703;
    for(let i=0;i<q.length;i++) {h = Math.imul(h ^ q.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19;}
    const idx = (h >>> 0) % 3;
    
    const CENTERS = [
      {n:'GreenLoop Textile Hub',a:'14 Circular Ave',d:'1.2 km'},
      {n:'City ReWear Collection Point',a:'88 Second Chance Rd',d:'2.7 km'},
      {n:'FiberCycle Depot (Municipal)',a:'3 Loop Lane, North Yard',d:'4.1 km'}
    ];
    const c = CENTERS[idx];
    setLocResult(`Nearest collector for <b>${q.replace(/</g,'&lt;')}</b>:<br><b>${c.n}</b> — ${c.a} · ${c.d} away<br><span class="font-mono text-[11.5px] text-muted">open Mon–Sat 08:00–18:00 · accepts bagged, dry textiles incl. stretch blends</span>`);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <header className="sticky top-0 z-50 bg-[#F4F1EA]/90 backdrop-blur-md border-b border-line">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px] h-14 sm:h-16 flex items-center justify-between border-b border-line/30">
          <button 
            onClick={() => scrollToSection('section-a')}
            className="flex items-center gap-2 no-underline font-display font-bold tracking-[0.06em] text-[13px] sm:text-[14px] shrink-0 bg-transparent border-none cursor-pointer"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green shadow-[0_0_0_4px_var(--color-green-soft)]"></span>
            TCHIBO <em className="not-italic text-green text-[10px] border border-green rounded-full px-1.5 py-0 tracking-[0.12em]">DPP</em>
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-4">
              <select className="bg-transparent border border-line-2 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-muted outline-none cursor-pointer">
                <option>Customer View</option>
                <option>Supply Chain</option>
                <option>Recycler</option>
                <option>Authority</option>
              </select>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Tchibo DPP', url: window.location.href }).catch(() => {});
                  } else {
                    handleCopy();
                  }
                }}
                className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
              >
                <Share size={14} /> Share
              </button>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
              >
                <Download size={14} /> JSON
              </button>
            </div>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Tchibo DPP', url: window.location.href }).catch(() => {});
                } else {
                  handleCopy();
                }
              }}
              className="md:hidden p-1.5 text-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
            >
              <Share size={18} />
            </button>
          </div>
        </div>
        
        {/* Tab Bar Tier */}
        <div ref={tabNavRef} className="bg-white/50 overflow-x-auto no-scrollbar scroll-smooth relative">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px] py-1.5 sm:py-2">
            <div className="flex gap-1">
              {SECTIONS.map((link) => (
                <button
                  key={link.id}
                  id={`tab-btn-${link.id}`}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative text-[11.5px] sm:text-[12px] font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap transition-all duration-200 border-none cursor-pointer ${
                    activeSection === link.id
                      ? 'bg-ink text-white shadow-custom'
                      : 'text-muted hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  <span className="opacity-70 font-mono text-[10px] mr-1.5">{link.letter}</span>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          {/* Subtle scroll progress line indicator */}
          <motion.div 
            className="h-[2px] bg-gradient-to-r from-green via-green-dark to-lime origin-left w-full absolute bottom-0 left-0 z-20 pointer-events-none"
            style={{ scaleX }}
          />
        </div>
      </header>

      <main className="pb-20">
        <section className="pt-6 sm:pt-8 max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="bg-green-dark text-[#EAF3EC] border border-[#2A362E] rounded-[18px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-custom">
            <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green flex items-center justify-center text-lime shrink-0">
                <ShieldCheck className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]" />
              </div>
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-bold text-white tracking-tight flex items-center gap-2">
                  Verified Passport <CheckCircle2 className="w-[15px] h-[15px] sm:w-[16px] sm:h-[16px] text-lime" />
                </h2>
                <p className="text-[12px] sm:text-[13px] text-[#B9D3C1] mt-0.5">Project ID: 151546 · v2.4</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[10px] sm:text-[11.5px] font-mono bg-ink/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[#B9D3C1] whitespace-nowrap">Updated: 30 Oct 2025</span>
              <span className="text-[10px] sm:text-[11.5px] font-mono bg-ink/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-lime whitespace-nowrap">Completeness: 94%</span>
            </div>
          </Reveal>
        </section>

        {/* Vertical Scroll Sections */}
        <div className="mt-2 divide-y divide-line/40">
          {/* Section A: Product Overview */}
          <section className="pt-6 sm:pt-12 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-a">
                <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
                  <Reveal className="flex items-center gap-3.5 sm:gap-[18px] mb-6 sm:mb-[30px]">
                    <div className="w-[42px] h-[42px] sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">A</div>
                    <div>
                      <h2 className="text-[18px] sm:text-[clamp(22px,3.4vw,30px)] font-bold tracking-tight">Product Overview</h2>
                      <p className="text-muted text-[12px] sm:text-[13.5px] mt-0.5">Identity, AI visuals & fit data</p>
                    </div>
                  </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 sm:gap-[26px] items-stretch">
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[34px] sm:pb-[30px] flex flex-col">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11.5px] text-green-dark bg-green-soft border border-[#BCD8C6] rounded-full px-2.5 py-1 sm:py-1.5 mb-3.5">
                  <span className="w-[5px] h-[5px] rounded-full bg-green animate-pulse-ring"></span>
                  DPP · PROJECT 151546
                </div>
              </div>
              <h1 className="font-display text-[24px] sm:text-[clamp(28px,4.2vw,42px)] font-bold tracking-tight leading-[1.1] sm:leading-[1.06]">Men&apos;s Shorty Pyjamas, Modal</h1>
              <p className="text-muted my-1.5 mb-4 sm:mb-[22px] text-[13px] sm:text-[14.5px]">Single jersey 160 g/m² · Sizes S–XXL</p>
              
              <div className="border border-dashed border-line-2 rounded-[14px] p-3.5 sm:p-4 sm:px-[18px] grid gap-2.5 bg-surface-2">
                <div className="flex justify-between items-center gap-3 text-[12.5px] sm:text-[13px]"><span className="text-muted font-semibold text-[10px] tracking-widest uppercase">Brand</span><span className="font-mono text-[12px] sm:text-[12.5px] font-medium text-right">Tchibo GmbH</span></div>
                <div className="flex justify-between items-center gap-3 text-[12.5px] sm:text-[13px]"><span className="text-muted font-semibold text-[10px] tracking-widest uppercase">Article No.</span>
                  <span className="flex gap-2 items-center"><span className="font-mono text-[12px] sm:text-[12.5px] font-medium text-right">{ART[curStyle][curSize]}</span><button onClick={handleCopy} className="border border-line-2 bg-white rounded-lg px-2 py-0.5 sm:px-[9px] sm:py-[3px] text-[10px] font-semibold text-muted transition-colors hover:text-green-dark hover:border-green cursor-pointer">Copy</button></span>
                </div>
                <div className="flex justify-between items-center gap-3 text-[12.5px] sm:text-[13px]"><span className="text-muted font-semibold text-[10px] tracking-widest uppercase">Season</span><span className="font-mono text-[12px] sm:text-[12.5px] font-medium text-right">AW 2025</span></div>
                <div className="mt-3 pt-3 border-t border-line-2">
                  <p className="text-[11.5px] leading-relaxed text-muted"><b className="text-ink">Design:</b> V-neck top with piping; shorts with drawstring, pockets & fake fly.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 sm:mt-[18px]">
                <div className="bg-surface-2 border border-line rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                  <div className="text-[9px] font-semibold text-muted uppercase tracking-widest mb-1">Weight</div>
                  <div className="text-[13px] sm:text-[14px] font-bold">160 g/m²</div>
                </div>
                <div className="bg-surface-2 border border-line rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                  <div className="text-[9px] font-semibold text-muted uppercase tracking-widest mb-1">Origin</div>
                  <div className="text-[13px] sm:text-[14px] font-bold">Bangladesh</div>
                </div>
                <div className="bg-surface-2 border border-line rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                  <div className="text-[9px] font-semibold text-muted uppercase tracking-widest mb-1">Lifetime</div>
                  <div className="text-[13px] sm:text-[14px] font-bold">3+ Years</div>
                </div>
                <div className="bg-surface-2 border border-line rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                  <div className="text-[9px] font-semibold text-muted uppercase tracking-widest mb-1">Impact</div>
                  <div className="text-[13px] sm:text-[14px] font-bold text-green-dark">4.8 kg CO₂e</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-[18px]">
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted"><b className="text-green-dark">CmiA</b> Cotton (SCOT)</span>
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted"><b className="text-green-dark">Birla</b> Modal</span>
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted"><b className="text-green-dark">creora®</b> Elastane</span>
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted">RSL Cat 1 <b className="text-green-dark">v1/2024</b></span>
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted"><b className="text-green-dark">REACh</b> confirmed</span>
                <span className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-line-2 bg-white text-muted">Label: <b className="text-green-dark">DE, EN, FR, NL</b></span>
              </div>

              <div className="mt-auto pt-[22px] flex items-center gap-[14px]">
                <QRCode />
                <div className="text-[11.5px] text-muted leading-relaxed"><b className="text-ink block">Scan to verify passport record</b>Lab (6825)298-0551 · Bureau Veritas BD<br/>FiTS v4 · Last updated 30 Oct 2025</div>
              </div>
            </Reveal>

            <Reveal className="overflow-hidden flex flex-col bg-surface border border-line rounded-[18px] shadow-custom">
              <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-line gap-2.5 flex-wrap">
                <span className="text-[12px] font-bold tracking-widest uppercase text-green-dark flex gap-2 items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>AI Model Visualization
                </span>
                <div className="flex bg-surface-2 border border-line rounded-full p-[3px]">
                  <button onClick={() => setCurView('cw1')} className={`relative border-none bg-transparent rounded-full px-[13px] py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${curView === 'cw1' ? 'text-[#F4F1EA]' : 'text-muted hover:text-ink'}`}>
                    {curView === 'cw1' && <motion.div layoutId="cwToggle" className="absolute inset-0 bg-ink rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <span className="relative z-10">CW 01 · Jadeite</span>
                  </button>
                  <button onClick={() => setCurView('cw2')} className={`relative border-none bg-transparent rounded-full px-[13px] py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${curView === 'cw2' ? 'text-[#F4F1EA]' : 'text-muted hover:text-ink'}`}>
                    {curView === 'cw2' && <motion.div layoutId="cwToggle" className="absolute inset-0 bg-ink rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <span className="relative z-10">CW 02 · Dark Green AOP</span>
                  </button>
                </div>
              </div>
              <div className="relative aspect-square bg-[#EAE4D6] overflow-hidden">
                <Image src="https://image.qwenlm.ai/public_source/664e8b35-e47f-4aa4-bc0f-a8f86843d2cf/17e958788-08d4-403f-bf77-8f3c19bb0af5.png" alt="AI render colourway 01 jadeite pyjama set" fill className={`object-cover transition-opacity duration-500 ${curView === 'cw1' ? 'opacity-100' : 'opacity-0'}`} />
                <Image src="https://image.qwenlm.ai/public_source/664e8b35-e47f-4aa4-bc0f-a8f86843d2cf/140b0a39b-fd34-414d-809d-bf230e553a0f.png" alt="AI render colourway 02 dark green AOP pyjama set" fill className={`object-cover transition-opacity duration-500 ${curView === 'cw2' ? 'opacity-100' : 'opacity-0'}`} />
                <span className="absolute left-[14px] bottom-[14px] bg-ink/80 text-[#F4F1EA] font-mono text-[10.5px] px-2.5 py-1.5 rounded-lg backdrop-blur-sm">rendered from FiTS 151546 · design sketch rev 4</span>
              </div>
              <div className="p-[18px] py-[14px] grid gap-1.5 font-mono text-[11px] text-muted">
                <span>model: <b className="text-green-dark font-medium">Stable Diffusion XL + Vizcom refine</b> · seed <b className="text-green-dark font-medium">151546</b></span>
                <span>prompt: <b className="text-green-dark font-medium">&quot;men&apos;s modal shorty pyjamas, V-neck, drawstring shorts, jadeite / dark green AOP, ghost mannequin&quot;</b></span>
                <span>colours locked to: <b className="text-green-dark font-medium">Pantone 16-5304 TCX · COLORO 097-36-06 · AOP base 085-52-07</b></span>
              </div>
            </Reveal>
          </div>

          <Reveal className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] overflow-hidden bg-surface border border-line rounded-[18px] shadow-custom mt-[26px]">
            <div className="lg:border-r border-b lg:border-b-0 border-line p-[26px] bg-surface-2 flex flex-col gap-3.5">
              <div className="flex justify-between items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold">Measurement Map</h3>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-green/10 text-green-dark">Interactive</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-white border border-line rounded-full p-[3px]">
                    <button onClick={() => { setCurGar('top'); setSelectedMeasurementKey('A'); }} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curGar === 'top' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                      {curGar === 'top' && <motion.div layoutId="garToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                      <span className="relative z-10">Top</span>
                    </button>
                    <button onClick={() => { setCurGar('bottom'); setSelectedMeasurementKey('A'); }} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curGar === 'bottom' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                      {curGar === 'bottom' && <motion.div layoutId="garToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                      <span className="relative z-10">Bottom</span>
                    </button>
                  </div>
                  <div className="flex bg-white border border-line rounded-full p-[3px]">
                    <button onClick={() => setCurUnit('cm')} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curUnit === 'cm' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                      {curUnit === 'cm' && <motion.div layoutId="unitToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                      <span className="relative z-10">cm</span>
                    </button>
                    <button onClick={() => setCurUnit('in')} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curUnit === 'in' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                      {curUnit === 'in' && <motion.div layoutId="unitToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                      <span className="relative z-10">in</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-line rounded-[14px] p-[16px] flex flex-col items-center justify-center relative group">
                <GarmentMapSvg
                  garment={curGar}
                  activeKey={selectedMeasurementKey || hoveredGar}
                  onSelectKey={handleSelectMeasurement}
                  isMini={false}
                />
                <div className="mt-2 flex items-center justify-between w-full text-[11px] font-mono text-muted border-t border-line/60 pt-2">
                  <span>CLICK PIN OR ROW TO INSPECT</span>
                  <span className="text-green-dark font-medium font-sans">Active: Key {currentActiveDef?.k} ({currentActiveDef?.name})</span>
                </div>
              </div>

              <div className="text-[11.5px] text-muted flex gap-2.5 flex-wrap">
                {curGar === 'top' ? (
                  <><span><i className="font-mono font-bold text-green-dark not-italic">A</i> ½ chest</span><span><i className="font-mono font-bold text-green-dark not-italic">B</i> length</span><span><i className="font-mono font-bold text-green-dark not-italic">C</i> sleeve</span><span><i className="font-mono font-bold text-green-dark not-italic">D</i> shoulder</span><span><i className="font-mono font-bold text-green-dark not-italic">E</i> armhole</span></>
                ) : (
                  <><span><i className="font-mono font-bold text-green-dark not-italic">A</i> ½ waistband</span><span><i className="font-mono font-bold text-green-dark not-italic">B</i> ½ hip</span><span><i className="font-mono font-bold text-green-dark not-italic">C</i> inseam</span><span><i className="font-mono font-bold text-green-dark not-italic">D</i> front rise</span><span><i className="font-mono font-bold text-green-dark not-italic">E</i> leg opening</span></>
                )}
              </div>
            </div>

            <div className="p-[26px]">
              <div className="flex justify-between items-center gap-2.5 flex-wrap mb-3">
                <div>
                  <h3 className="text-[15px] font-bold">Interactive Size Chart</h3>
                  <p className="text-[11px] text-muted mt-0.5">Click any row to open the mini map inspector</p>
                </div>
                <span className="font-mono text-[11px] text-muted bg-surface-2 border border-line rounded-lg px-2 py-1">SIZE {curSize} · EU {EU[curSize]}</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-1.5">
                {(['S','M','L','XL','XXL'] as Size[]).map(s => (
                  <button key={s} onClick={() => setCurSize(s)} className={`relative min-w-[46px] h-10 rounded-xl border font-semibold text-[13px] transition-colors cursor-pointer ${curSize === s ? 'border-ink text-lime' : 'bg-white border-line-2 text-muted hover:border-ink hover:text-ink'}`}>
                    {curSize === s && <motion.div layoutId="sizeToggle" className="absolute inset-0 bg-ink rounded-xl z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <span className="relative z-10">{s}</span>
                  </button>
                ))}
              </div>
              <div className="text-[11.5px] text-muted mb-3.5">
                EU mapping: 44/46 S · 48/50 M · 52/54 L · 56/58 XL · 60/62 XXL · <b className="text-green-dark">style:</b>
                <span className="inline-flex ml-1 bg-white border border-line rounded-full p-[3px] align-middle">
                  <button onClick={() => setCurStyle('uni')} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curStyle === 'uni' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                    {curStyle === 'uni' && <motion.div layoutId="styleToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <span className="relative z-10">Uni</span>
                  </button>
                  <button onClick={() => setCurStyle('aop')} className={`relative border-none bg-transparent rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${curStyle === 'aop' ? 'text-white' : 'text-muted hover:text-ink'}`}>
                    {curStyle === 'aop' && <motion.div layoutId="styleToggle" className="absolute inset-0 bg-green rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <span className="relative z-10">AOP</span>
                  </button>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-soft border border-[#BCD8C6] text-green-dark font-mono text-[11.5px] rounded-lg px-3 py-1.5 mb-3.5">
                Art. {ART[curStyle][curSize]} · He. Shorty, Modal, {curStyle}, {curSize}
              </div>
              
              <table className="w-full border-collapse">
                <tbody>
                  {activeMeasurementList.map(r => {
                    const isSelected = selectedMeasurementKey === r.k && showMiniOverlay;
                    const isHovered = hoveredGar === r.g;
                    return (
                      <tr 
                        key={r.k} 
                        className={`border-b border-line last:border-b-0 cursor-pointer transition-colors group ${isSelected ? 'bg-green-soft/70' : isHovered ? 'bg-green-soft/40' : 'hover:bg-green-soft/30'}`}
                        onMouseEnter={() => setHoveredGar(r.g)}
                        onMouseLeave={() => setHoveredGar(null)}
                        onClick={() => handleSelectMeasurement(r.k)}
                      >
                        <td className="p-2.5 pl-0 w-[34px]">
                          <span className={`w-[26px] h-[26px] rounded-lg grid place-items-center font-mono text-[12px] font-medium transition-colors ${isSelected ? 'bg-ink text-lime' : isHovered ? 'bg-green text-white' : 'bg-green-soft text-green-dark group-hover:bg-green group-hover:text-white'}`}>
                            {r.k}
                          </span>
                        </td>
                        <td className="p-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[13.5px]">{r.name}</span>
                            {isSelected && (
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-green/10 text-green-dark animate-pulse">Inspecting</span>
                            )}
                          </div>
                          <span className="block text-muted text-[11.5px] font-normal">{r.how}</span>
                        </td>
                        <td className="p-2.5 pr-0 font-mono font-medium text-right text-[14px]">
                          <span className="inline-block val-tick" key={`${r.k}-${curSize}-${curUnit}`}>{fmt(r.vals[curSize] as number)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 bg-surface-2 border border-dashed border-line-2 rounded-[14px] p-4 px-[18px]">
                <h4 className="text-[13px] tracking-widest uppercase text-green-dark mb-2 font-bold">Fit Guide</h4>
                <p className="text-[13px] text-muted">{FIT[curGar]}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section B: Traceability */}
      <section className="pt-10 sm:pt-16 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-b">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="flex items-center gap-[14px] sm:gap-[18px] mb-6 sm:mb-[30px]">
            <div className="w-10 h-10 sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">B</div>
            <div>
              <h2 className="text-[20px] sm:text-[clamp(22px,3.4vw,30px)] font-bold tracking-tight">Traceability Journey</h2>
              <p className="text-muted text-[12px] sm:text-[13.5px] mt-0.5">Tier 1 to Tier 4 verified nodes per FiTS & SCOT</p>
            </div>
          </Reveal>

          <Reveal><OriginMap /></Reveal>
          <Reveal><TraceBar /></Reveal>

          <RevealGroup className="relative pl-6 sm:pl-[34px] grid gap-4 sm:gap-[22px] mb-3.5">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green via-green to-amber-line"></div>
            
            <RevealItem className="relative">
              <div className="absolute -left-[30px] top-[22px] w-4 h-4 rounded-full bg-amber border-[4px] border-bg shadow-[0_0_0_2px_var(--color-amber)]"></div>
              <div className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] px-[24px] transition-transform hover:-translate-y-[3px]">
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="font-mono text-[11px] font-medium bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em]">TIER 3</span>
                  <span className="font-mono text-[11.5px] text-muted">Q3 2025</span>
                  <span className="text-line-2 ml-auto text-[16px]">⟰</span>
                </div>
                <h3 className="text-[17px] font-bold">Yarn & Fibre Sourcing — CmiA · Birla · Hyosung</h3>
                <p className="text-[12.5px] text-muted my-1 mb-3">Cotton made in Africa partner countries · Birla Modal (cellulosic) · creora® elastane (Hyosung) · SCOT-tracked chain</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">SCOT Registration</div>
                    <div className="text-[12.5px] font-bold mt-0.5">ID: PENDING (AKH-B01)</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Cotton 48%</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">CmiA certified, ring-spun Ne 34/1 combed, S-twist</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Modal 47%</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Nominated Birla fibres (Livaeco™ eligible)</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Elastane 5%</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">creora® 20 D · certificate issued by Hyosung</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-[7px] mt-3 bg-amber-soft border border-dashed border-amber-line text-amber text-[12px] font-semibold rounded-xl px-[13px] py-2">
                  <span className="w-2 h-2 rounded-full bg-amber"></span>
                  Raw cotton fibre (farm-level) origin: Data Pending / Out of Scope — SCOT chain verified at spinning-mill level only
                </span>
              </div>
            </RevealItem>

            <RevealItem className="relative">
              <div className="absolute -left-[30px] top-[22px] w-4 h-4 rounded-full bg-green border-[4px] border-bg shadow-[0_0_0_2px_var(--color-green)]"></div>
              <div className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] px-[24px] transition-transform hover:-translate-y-[3px]">
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="font-mono text-[11px] font-medium bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em]">TIER 2</span>
                  <span className="font-mono text-[11.5px] text-muted">SEP 2025</span>
                  <span className="text-line-2 ml-auto text-[16px]">⟰</span>
                </div>
                <h3 className="text-[17px] font-bold">Fabric Manufacturing — AKH Knitting & Dyeing Ltd.</h3>
                <p className="text-[12.5px] text-muted my-1 mb-3">🇧🇩 Bangladesh · knitting, dyeing & finishing in-house · Birla fibre declaration + invoice on file</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Knitting</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Single jersey, gauge 32×28 · 42 courses / 30 wales per 2 cm</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Dyeing</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Jadeite 16-5304 TCX · Dark Green 097-36-06 · AOP pigment print (base 085-52-07)</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Finishing</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Softener finish · 160 g/m² ±5%</div>
                  </div>
                </div>
              </div>
            </RevealItem>

            <RevealItem className="relative">
              <div className="absolute -left-[30px] top-[22px] w-4 h-4 rounded-full bg-green border-[4px] border-bg shadow-[0_0_0_2px_var(--color-green)]"></div>
              <div className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] px-[24px] transition-transform hover:-translate-y-[3px]">
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="font-mono text-[11px] font-medium bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em]">TIER 1</span>
                  <span className="font-mono text-[11.5px] text-muted">OCT 2025</span>
                  <span className="text-line-2 ml-auto text-[16px]">⟰</span>
                </div>
                <h3 className="text-[17px] font-bold">Garment Assembly — AKH Knitting and Dyeing Ltd. (CMT)</h3>
                <p className="text-[12.5px] text-muted my-1 mb-3">🇧🇩 Bangladesh · Cut, Make & Trim · order 4300085070 · AQL release KF 0 / HF 2.5 / NF 4.0</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Top</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">V-neck self-fabric piping, necktape chain-stitched, shoulder +2 cm forward</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Bottom</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Set-on waistband w/ drawstring + elastic, side pockets, fake fly &quot;J&quot; stitch</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Seams</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">4-thread overlock · 3-thread coverstitch hem 2.5 cm · ≥ 5 st/cm knitwear</div>
                  </div>
                </div>
              </div>
            </RevealItem>

            <RevealItem className="relative">
              <div className="absolute -left-[30px] top-[22px] w-4 h-4 rounded-full bg-green border-[4px] border-bg shadow-[0_0_0_2px_var(--color-green)]"></div>
              <div className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] px-[24px] transition-transform hover:-translate-y-[3px]">
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="font-mono text-[11px] font-medium bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em]">LAB</span>
                  <span className="font-mono text-[11.5px] text-muted">30 OCT 2025</span>
                  <span className="text-line-2 ml-auto text-[16px]">⟰</span>
                </div>
                <h3 className="text-[17px] font-bold">Testing & Release — Bureau Veritas CPS (BD) Ltd.</h3>
                <p className="text-[12.5px] text-muted my-1 mb-3">🇧🇩 Plot #130, DEPZ Extension Area, Ganakbari, Savar, Dhaka · Report (6825)298-0551 · reviewed by R. Belal Hossain, Sr. Manager</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Scope</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">RSL Cat 1 v1/2024 + Tchibo physical tests (FiTS 13 Aug 2025)</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Overall result</div>
                    <div className="text-[12.5px] font-semibold mt-0.5 text-green-dark">PASS — complies with FiTS & EU legal requirements</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Destination</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">DE · AT · CZ · HU · SK · PL · CH · TR</div>
                  </div>
                </div>
              </div>
            </RevealItem>

            <RevealItem className="relative">
              <div className="absolute -left-[30px] top-[22px] w-4 h-4 rounded-full bg-green border-[4px] border-bg shadow-[0_0_0_2px_var(--color-green)]"></div>
              <div className="bg-surface border border-line rounded-[18px] shadow-custom p-[22px] px-[24px] transition-transform hover:-translate-y-[3px]">
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="font-mono text-[11px] font-medium bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em]">LOGISTICS</span>
                  <span className="font-mono text-[11.5px] text-muted">NOV 2025</span>
                </div>
                <h3 className="text-[17px] font-bold">Transport & Distribution</h3>
                <p className="text-[12.5px] text-muted my-1 mb-3">Shipment to European distribution centers and final retail.</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Origin → Destination</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Chittagong, BD → Hamburg, DE</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Mode</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">Sea Freight (~14,500 km)</div>
                  </div>
                  <div className="bg-surface-2 border border-line rounded-xl p-2.5 px-3">
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">Emissions Profile</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">0.4 kg CO₂e per unit allocated</div>
                  </div>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Section C: Quality */}
      <section className="pt-10 sm:pt-16 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-c">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="flex items-center gap-[14px] sm:gap-[18px] mb-6 sm:mb-[30px]">
            <div className="w-10 h-10 sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">C</div>
            <div>
              <h2 className="text-[20px] sm:text-[clamp(22px,3.4vw,30px)] font-bold tracking-tight">Quality Analysis</h2>
              <p className="text-muted text-[12px] sm:text-[13.5px] mt-0.5">Composition, colour fastness & RSL results</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 sm:gap-[26px] items-start mb-6 sm:mb-[26px]">
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <h3 className="text-[16px] font-bold mb-1">Fabric Composition</h3>
              <p className="text-[12.5px] text-muted mb-[18px]">Labeled per Regulation (EU) 1007/2011 · tolerance ±3%</p>
              
              <CircularComposition cotton={48} modal={47} elastane={5} />
              
              <div className="mt-6 flex justify-between items-center bg-green-soft border border-[#BCD8C6] rounded-xl p-3 px-4">
                <span className="text-[11px] tracking-widest uppercase text-green-dark font-semibold">Fabric weight · spec 160 ±5%</span>
                <span className="font-display font-bold text-[22px] text-green-dark">160 <small className="text-[12px]">g/m²</small></span>
              </div>
              
              <div className="mt-3.5 flex justify-between items-center bg-surface-2 border border-line rounded-xl p-3 px-4">
                <span className="text-[11px] tracking-widest uppercase text-muted font-semibold">Recycled Content</span>
                <span className="font-display font-bold text-[22px] text-ink">0 <small className="text-[12px]">%</small></span>
              </div>
              
              <div className="mt-3.5 border border-dashed border-line-2 rounded-xl p-3 px-3.5 text-[12px] text-muted">
                Lab analysis (ISO 1833) — sample A:
                <table className="w-full border-collapse mt-1.5 mb-1.5">
                  <tbody>
                    <tr><td className="py-1 px-1.5 text-[12px]">Cotton</td><td className="py-1 px-1.5 text-[12px] text-right font-mono">labeled 48% → lab 49.2%</td></tr>
                    <tr><td className="py-1 px-1.5 text-[12px]">Modal</td><td className="py-1 px-1.5 text-[12px] text-right font-mono">labeled 47% → lab 46.9%</td></tr>
                    <tr><td className="py-1 px-1.5 text-[12px]">Elastane</td><td className="py-1 px-1.5 text-[12px] text-right font-mono">labeled 5% → lab 3.9%</td></tr>
                  </tbody>
                </table>
                All within ±3 tolerance → <b className="text-green-dark">PASS</b>
              </div>

              <div className="mt-3.5 border border-dashed border-line-2 rounded-xl p-3 px-3.5 text-[12px] text-muted">
                <b className="text-ink">Microfibre Release:</b> Elastane content 3.9% — synthetic fibre shedding applicable; wash bag recommended.
              </div>
            </Reveal>

            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px]">
              <h3 className="text-[16px] font-bold mb-1">Chemicals & Substances of Concern</h3>
              <p className="text-[12.5px] text-muted mb-4">SVHC (Substances of Very High Concern) per REACH declaration</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="text-[11px] text-muted uppercase tracking-widest border-b border-line-2">
                    <tr>
                      <th className="py-2 font-semibold">Substance</th>
                      <th className="py-2 font-semibold hidden sm:table-cell">CAS No.</th>
                      <th className="py-2 font-semibold">Component</th>
                      <th className="py-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line">
                      <td className="py-3 pr-2">Alkylphenol ethoxylates (APEO)</td>
                      <td className="py-3 font-mono text-muted text-[11.5px] hidden sm:table-cell">Multiple</td>
                      <td className="py-3">Dyeing</td>
                      <td className="py-3 text-right"><span className="text-[10px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-1 rounded-full whitespace-nowrap">NOT DETECTED</span></td>
                    </tr>
                    <tr className="border-b border-line">
                      <td className="py-3 pr-2">Heavy Metals (Extractable)</td>
                      <td className="py-3 font-mono text-muted text-[11.5px] hidden sm:table-cell">Multiple</td>
                      <td className="py-3">Pigment Print</td>
                      <td className="py-3 text-right"><span className="text-[10px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-1 rounded-full whitespace-nowrap">&lt; 0.1% LIMIT</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-2">PFAS (Per- and polyfluoroalkyl)</td>
                      <td className="py-3 font-mono text-muted text-[11.5px] hidden sm:table-cell">Multiple</td>
                      <td className="py-3">Finish</td>
                      <td className="py-3 text-right"><span className="text-[10px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-1 rounded-full whitespace-nowrap">NOT DETECTED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 pt-5 border-t border-line">
                <h3 className="text-[16px] font-bold mb-1">Restricted Substances — RSL Category 1 (v1/2024)</h3>
                <p className="text-[12.5px] text-muted mb-4">Adults &gt;14 y · all textiles · Bureau Veritas BD · <b className="text-green-dark">OVERALL PASS</b></p>
              <div className="grid gap-[9px]">
                {[
                  {n:'Formaldehyde',r:'ND(<16) mg/kg · limit 75'},
                  {n:'pH value',r:'5.5 – 6.5 · limit 4.0 – 7.5'},
                  {n:'Azo amines (splitting off)',r:'ND(<5) mg/kg · limit 20'},
                  {n:'Phthalates',r:'ND(<50) mg/kg · limit 500 each'},
                  {n:'PAHs (18 sum)',r:'ND(<0.2) mg/kg · limit 10'},
                  {n:'Odour test',r:'Grade 1 · limit Grade 3'}
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center gap-3 bg-surface-2 border border-line rounded-[10px] p-[9px] px-[13px] text-[12.5px]">
                    <span className="font-semibold">{item.n}</span>
                    <span className="font-mono text-[11.5px] text-muted">{item.r}</span>
                    <span className="text-[10.5px] font-bold tracking-[0.08em] bg-green-soft text-green-dark border border-[#BCD8C6] rounded-full px-2.5 py-[3px] whitespace-nowrap">PASS</span>
                  </div>
                ))}
              </div>
              </div>
            </Reveal>
          </div>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RevealItem><LabCard std="DIN EN ISO 105-C06" title="Colour Fastness to Washing" val="4–5" subVal="req. 4-5 / stain 4" desc="Test A2S, 30 min @ 40 °C, ECE detergent + sodium perborate, 10 steel balls. Colour change & staining 4-5 across all 4 colourways (A–D)." hint="tap for method ↓" /></RevealItem>
            <RevealItem><LabCard std="DIN EN ISO 105-X12" title="Colour Fastness to Rubbing" val="4–5" subVal="dry & wet · req. 4" desc="Length-wise & width-wise on body, contrast and drawcord. All results 4–5, above the grade-4 requirement." hint="tap for method ↓" /></RevealItem>
            <RevealItem><LabCard std="DIN EN ISO 105-B02" title="Colour Fastness to Light" val="4" subVal="req. 4" desc="Artificial light exposure, colour change @ grade 4 on body, contrast and drawcord for all colourways." hint="tap for method ↓" /></RevealItem>
            <RevealItem><LabCard std="DIN EN ISO 105-E04" title="Fastness to Perspiration" val="4–5" subVal="acid & alkaline" desc="Colour change, self-staining and staining of acetate/cotton/nylon/polyester/acrylic/wool all 4–5 (req. 4-5 / 4)." hint="tap for method ↓" /></RevealItem>
            <RevealItem><LabCard std="DIN EN ISO 105-E01" title="Colour Fastness to Water" val="4–5" subVal="req. 4-5 / stain 4" desc="Colour change & self-staining 4-5; staining of all 6 adjacent fibres 4-5 across colourways A–D." hint="tap for method ↓" /></RevealItem>
            <RevealItem><LabCard std="ISO 1833" title="Quantitative Fibre Analysis" val="±1.2%" subVal="max dev. · tol. ±3" desc="Lab vs labeled: cotton +1.2 / modal − 0.1 / elastane − 1.1 (sample A). All four colourways within EU 1007/2011 tolerance." hint="tap for method ↓" /></RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Section D: Care */}
      <section className="pt-10 sm:pt-16 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-d">
        <div className="max-w-[1120px] mx-auto px-[22px]">
          <Reveal className="flex items-center gap-[18px] mb-[30px]">
            <div className="w-[58px] h-[58px] shrink-0 rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[26px] shadow-custom">D</div>
            <div>
              <h2 className="text-[clamp(22px,3.4vw,30px)] font-bold tracking-tight">Care, Maintenance & Stain Removal</h2>
              <p className="text-muted text-[13.5px] mt-0.5">Ginetex label decode + FiTS durability requirement (10 wash / 10 dry cycles)</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-[26px] items-start">
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <h3 className="text-[16px] font-bold mb-1">Standard Care Instructions</h3>
              <p className="text-[12.5px] text-muted mb-[18px]">As printed on the 25 mm woven care label (side seam, wearer&apos;s left)</p>
              
              <RevealGroup className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                <RevealItem className="bg-surface-2 border border-line rounded-xl p-3 px-1.5 text-center transition-colors hover:border-green hover:-translate-y-[2px]">
                  <svg className="w-[38px] h-[38px] stroke-green-dark mx-auto mb-2 block" viewBox="0 0 48 48" fill="none" strokeWidth="2.5"><path d="M7 15 L11 40 H37 L41 15"/><path d="M7 15 C10 19 14 19 17 15 C20 19 24 19 27 15 C30 19 34 19 37 15 C38.5 17 40 17 41 15"/><text x="24" y="33" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="IBM Plex Mono">40</text></svg>
                  <div className="text-[10.5px] font-semibold leading-[1.35] text-muted">Machine wash 40 °C normal</div>
                </RevealItem>
                <RevealItem className="bg-surface-2 border border-line rounded-xl p-3 px-1.5 text-center transition-colors hover:border-green hover:-translate-y-[2px]">
                  <svg className="w-[38px] h-[38px] stroke-green-dark mx-auto mb-2 block" viewBox="0 0 48 48" fill="none" strokeWidth="2.5"><path d="M24 9 L43 39 H5 Z"/><line x1="8" y1="10" x2="40" y2="42"/><line x1="40" y1="10" x2="8" y2="42"/></svg>
                  <div className="text-[10.5px] font-semibold leading-[1.35] text-muted">Do not bleach</div>
                </RevealItem>
                <RevealItem className="bg-surface-2 border border-line rounded-xl p-3 px-1.5 text-center transition-colors hover:border-green hover:-translate-y-[2px]">
                  <svg className="w-[38px] h-[38px] stroke-green-dark mx-auto mb-2 block" viewBox="0 0 48 48" fill="none" strokeWidth="2.5"><rect x="8" y="8" width="32" height="32" rx="3"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none"/></svg>
                  <div className="text-[10.5px] font-semibold leading-[1.35] text-muted">Tumble dry low heat</div>
                </RevealItem>
                <RevealItem className="bg-surface-2 border border-line rounded-xl p-3 px-1.5 text-center transition-colors hover:border-green hover:-translate-y-[2px]">
                  <svg className="w-[38px] h-[38px] stroke-green-dark mx-auto mb-2 block" viewBox="0 0 48 48" fill="none" strokeWidth="2.5"><path d="M9 34 C9 22 19 15 29 15 H41 V34 Z"/><circle cx="22" cy="27" r="2.2" fill="currentColor" stroke="none"/><circle cx="29" cy="27" r="2.2" fill="currentColor" stroke="none"/></svg>
                  <div className="text-[10.5px] font-semibold leading-[1.35] text-muted">Iron medium (2 dots)</div>
                </RevealItem>
                <RevealItem className="bg-surface-2 border border-line rounded-xl p-3 px-1.5 text-center transition-colors hover:border-green hover:-translate-y-[2px]">
                  <svg className="w-[38px] h-[38px] stroke-green-dark mx-auto mb-2 block" viewBox="0 0 48 48" fill="none" strokeWidth="2.5"><circle cx="24" cy="24" r="15"/><line x1="10" y1="10" x2="38" y2="38"/></svg>
                  <div className="text-[10.5px] font-semibold leading-[1.35] text-muted">Do not dry clean</div>
                </RevealItem>
              </RevealGroup>
              <div className="mt-[18px] text-[13px] text-muted bg-surface-2 border border-dashed border-line-2 rounded-xl p-3.5 px-4">
                <b className="text-ink block mb-1">Label wording (EN):</b>
                &quot;Colour detergent recommended · Wash with similar colours.&quot; Wash at max 40 °C, turn set inside-out, and skip optical-brightener detergents to protect the Jadeite / Dark Green shades. FiTS requires appearance & function to survive <b>10 wash + 10 dry cycles</b> — this batch passed all fastness grades 4–5.
              </div>
            </Reveal>

            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px]">
              <h3 className="text-[16px] font-bold mb-1">Stain Removal Hacks</h3>
              <p className="text-[12.5px] text-muted mb-[18px]">Household fixes for modal jersey before the next 40° wash</p>
              
              <div className="flex gap-2 mb-[18px] flex-wrap">
                <button onClick={() => setStainTab('oil')} className={`relative border border-line-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer ${stainTab === 'oil' ? 'border-red text-white' : 'bg-white text-muted hover:border-red hover:text-red'}`}>
                  {stainTab === 'oil' && <motion.div layoutId="stainToggle" className="absolute inset-0 bg-red rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                  <span className="relative z-10">🧴 Oil & Grease</span>
                </button>
                <button onClick={() => setStainTab('ink')} className={`relative border border-line-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer ${stainTab === 'ink' ? 'border-red text-white' : 'bg-white text-muted hover:border-red hover:text-red'}`}>
                  {stainTab === 'ink' && <motion.div layoutId="stainToggle" className="absolute inset-0 bg-red rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                  <span className="relative z-10">🖋️ Ink</span>
                </button>
                <button onClick={() => setStainTab('food')} className={`relative border border-line-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer ${stainTab === 'food' ? 'border-red text-white' : 'bg-white text-muted hover:border-red hover:text-red'}`}>
                  {stainTab === 'food' && <motion.div layoutId="stainToggle" className="absolute inset-0 bg-red rounded-full z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                  <span className="relative z-10">🍷 Food & Drinks</span>
                </button>
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {stainTab === 'oil' && (
                    <motion.div key="oil" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <ol className="list-decimal pl-4 mb-3.5 grid gap-[9px] text-[13px] text-muted">
                        <li><b className="text-ink">Blot</b> — never rub — excess oil with a paper towel.</li>
                        <li>Sprinkle <b className="text-ink">baking soda</b> on the spot, wait 10 min to absorb, brush off.</li>
                        <li>Work one drop of <b className="text-ink">clear dish soap</b> into the stain from the back side.</li>
                        <li>Rinse warm, then machine wash at 40 °C with colour detergent.</li>
                      </ol>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">dish soap</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">baking soda</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">soft brush</span>
                      </div>
                    </motion.div>
                  )}
                  {stainTab === 'ink' && (
                    <motion.div key="ink" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <ol className="list-decimal pl-4 mb-3.5 grid gap-[9px] text-[13px] text-muted">
                        <li>Place a folded towel <b className="text-ink">inside</b> the garment under the stain.</li>
                        <li>Dab with <b className="text-ink">70% rubbing alcohol</b> on a cotton pad — blot edges inward.</li>
                        <li>Repeat until transfer stops; do not scrub (spreads the dye).</li>
                        <li>Rinse cold, then wash with similar colours at 40 °C.</li>
                      </ol>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">rubbing alcohol</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">cotton pads</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">cold water</span>
                      </div>
                    </motion.div>
                  )}
                  {stainTab === 'food' && (
                    <motion.div key="food" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <ol className="list-decimal pl-4 mb-3.5 grid gap-[9px] text-[13px] text-muted">
                        <li>Scoop off solids; run <b className="text-ink">cold water through the back</b> of the stain for 60 s.</li>
                        <li>Apply <b className="text-ink">white vinegar + baking soda</b> paste, rest 15 min.</li>
                        <li>Rinse; if a shadow remains, repeat once before drying.</li>
                        <li>Wash at 40 °C with colour detergent, similar colours.</li>
                      </ol>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">white vinegar</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">baking soda</span>
                        <span className="text-[11px] bg-red-soft text-red font-semibold rounded-full px-[11px] py-1.5">cold water</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-3.5 text-[12px] text-amber bg-amber-soft border border-dashed border-amber-line rounded-[10px] p-2.5 px-[14px] font-semibold">
                ⚠️ Never tumble-dry a stained garment — heat sets stains permanently.
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section E: Circularity */}
      <section className="pt-10 sm:pt-16 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-e">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="flex items-center gap-[14px] sm:gap-[18px] mb-6 sm:mb-[30px]">
            <div className="w-10 h-10 sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">E</div>
            <div>
              <h2 className="text-[20px] sm:text-[clamp(22px,3.4vw,30px)] font-bold tracking-tight">Circularity</h2>
              <p className="text-muted text-[12px] sm:text-[13.5px] mt-0.5">Fibre-to-fiber strategies & recycling instructions</p>
            </div>
          </Reveal>

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-[26px]">
            <div className="p-[18px] rounded-2xl bg-white border border-line shadow-custom transition-all hover:-translate-y-1 hover:border-green">
              <div className="w-[38px] h-[38px] rounded-xl bg-green-soft grid place-items-center text-[18px] mb-3">🌊</div>
              <h4 className="text-[13.5px] font-bold mb-1">Wash at 40° or cooler</h4>
              <p className="text-[12px] text-muted">Modal loves cool water; gentle cycles protect the elastane&apos;s recovery for 10+ FiTS cycles.</p>
            </div>
            <div className="p-[18px] rounded-2xl bg-white border border-line shadow-custom transition-all hover:-translate-y-1 hover:border-green">
              <div className="w-[38px] h-[38px] rounded-xl bg-green-soft grid place-items-center text-[18px] mb-3">🌬️</div>
              <h4 className="text-[13.5px] font-bold mb-1">Air dry flat</h4>
              <p className="text-[12px] text-muted">Knit jersey keeps its shape flat-dried; low tumble dry only when needed.</p>
            </div>
            <div className="p-[18px] rounded-2xl bg-white border border-line shadow-custom transition-all hover:-translate-y-1 hover:border-green">
              <div className="w-[38px] h-[38px] rounded-xl bg-green-soft grid place-items-center text-[18px] mb-3">🗄️</div>
              <h4 className="text-[13.5px] font-bold mb-1">Fold, don&apos;t hang</h4>
              <p className="text-[12px] text-muted">Knitted loops stretch on hangers — folded storage preserves the 4% dimensional spec.</p>
            </div>
            <div className="p-[18px] rounded-2xl bg-white border border-line shadow-custom transition-all hover:-translate-y-1 hover:border-green">
              <div className="w-[38px] h-[38px] rounded-xl bg-green-soft grid place-items-center text-[18px] mb-3">🧵</div>
              <h4 className="text-[13.5px] font-bold mb-1">Repair seams early</h4>
              <p className="text-[12px] text-muted">Coverstitch hems & overlock seams are re-stitchable — a 5-min mend adds years.</p>
            </div>
          </Reveal>

          <Reveal className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] overflow-hidden bg-surface border border-line rounded-[18px] shadow-custom mb-[26px]">
            <div className="relative bg-[#EAE4D6] min-h-[300px]">
              <span className="absolute top-[14px] left-[14px] bg-ink/85 text-lime font-mono text-[10.5px] rounded-lg px-2.5 py-1.5 z-10">NO-SEW · ~25 MIN</span>
              <Image src="https://image.qwenlm.ai/public_source/664e8b35-e47f-4aa4-bc0f-a8f86843d2cf/1eb313437-56f6-42b6-be85-d49488aabe23.png" alt="Upcycled pyjama fabric" fill className="object-cover" />
            </div>
            <div className="p-[26px] sm:px-[28px]">
              <h3 className="text-[18px] font-bold mb-1">DIY Upcycle: Retired Pyjamas → Pouch + Cleaning Cloths</h3>
              <p className="text-[12.5px] text-muted mt-0.5 mb-2.5">Modal jersey is ultra-absorbent — perfect second life. Reuse the original drawstring!</p>
              <div className="flex gap-2 my-2.5 mb-4 flex-wrap">
                <span className="text-[11px] font-semibold rounded-full px-[11px] py-1.5 bg-surface-2 border border-line-2 text-muted">⏱️ ~25 min</span>
                <span className="text-[11px] font-semibold rounded-full px-[11px] py-1.5 bg-surface-2 border border-line-2 text-muted">👕 Beginner</span>
                <span className="text-[11px] font-semibold rounded-full px-[11px] py-1.5 bg-surface-2 border border-line-2 text-muted">✂️ Scissors only</span>
                <span className="text-[11px] font-semibold rounded-full px-[11px] py-1.5 bg-surface-2 border border-line-2 text-muted">♻️ 0 waste</span>
              </div>
              <div className="border-t border-line">
                <AccordionItem num="1" title="Rescue the drawstring" text="Open one buttonhole at the waistband and gently pull out the knitted drawstring intact — it becomes the closure for your new pouch." isOpen={accOpen===1} onClick={() => setAccOpen(accOpen===1 ? null : 1)} />
                <AccordionItem num="2" title="Cut cleaning cloths" text="From the top's front & back panels, cut 25×25 cm squares. Jersey curls slightly but won't fray — no hemming needed for dusting or glass cloths." isOpen={accOpen===2} onClick={() => setAccOpen(accOpen===2 ? null : 2)} />
                <AccordionItem num="3" title="Cut the pouch blank" text="From the shorts' legs cut one 30×44 cm rectangle. Fold in half (right sides together) leaving the fold at the bottom." isOpen={accOpen===3} onClick={() => setAccOpen(accOpen===3 ? null : 3)} />
                <AccordionItem num="4" title="Knot-seal the sides" text="Cut 1.5 cm × 7 cm fringe along both open side edges and double-knot each front/back pair tightly — a no-sew seam that holds laundry-bag loads." isOpen={accOpen===4} onClick={() => setAccOpen(accOpen===4 ? null : 4)} />
                <AccordionItem num="5" title="Thread & finish" text="Turn right-side out, fold the top edge down twice to form a channel, snip two tiny holes, and thread the rescued drawstring through with a safety pin. Done! ✨" isOpen={accOpen===5} onClick={() => setAccOpen(accOpen===5 ? null : 5)} />
              </div>
              <div className="mt-4 text-[12.5px] text-muted bg-surface-2 border border-dashed border-line-2 rounded-xl p-3 px-4">
                <b className="text-green-dark">Too worn to craft?</b> Cut panels become drawer liners or shoe-bags — modal&apos;s soft handfeel makes it ideal for delicate surfaces.
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-[26px]">
            <Reveal className="bg-green-dark text-[#EAF3EC] border border-none rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <h3 className="text-[16px] font-bold text-white mb-1.5">♻️ Fibre Facts & Take-Back</h3>
              <p className="text-[12.5px] text-[#B9D3C1] mb-4">What happens after the last wear</p>
              <ul className="list-none grid gap-2.5 text-[13px]">
                <li className="flex gap-2.5 items-start"><i className="not-italic text-lime">→</i> 48% CmiA cotton + 47% modal = 95% cellulosic, mechanically recyclable into open-end yarn.</li>
                <li className="flex gap-2.5 items-start"><i className="not-italic text-lime">→</i> 5% elastane keeps it in the &quot;stretch-blend&quot; recycling stream — never landfill.</li>
                <li className="flex gap-2.5 items-start"><i className="not-italic text-lime">→</i> Return via retailer textile collection; CmiA & Birla fibres are traceable for fibre-to-fiber programs.</li>
              </ul>
              <div className="mt-[18px] bg-[#D8F34E]/10 border border-dashed border-[#D8F34E]/50 rounded-xl p-3 px-4 text-[12.5px] text-lime font-semibold">
                Return any worn Tchibo textile at participating stores — collection supports fibre-to-fibre recycling
              </div>
            </Reveal>

            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px]">
              <h3 className="text-[16px] font-bold mb-1.5">📍 Local Textile Drop-Off</h3>
              <p className="text-[12.5px] text-muted mb-4">EU separate textile collection active since Jan 2025</p>
              <form onSubmit={handleLocSearch} className="flex gap-2.5 mb-3.5">
                <input type="text" placeholder="Enter city or postcode..." required className="flex-1 border border-line-2 rounded-xl p-2.5 px-3.5 text-[13px] bg-surface-2 outline-none transition-colors focus:border-green focus:bg-white" />
                <button type="submit" className="bg-ink text-lime border-none rounded-xl p-2.5 px-[18px] font-bold text-[13px] cursor-pointer">Find</button>
              </form>
              <AnimatePresence>
                {locResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-soft border border-[#BCD8C6] rounded-xl p-3.5 px-4 text-[13px]" dangerouslySetInnerHTML={{ __html: locResult }} />
                )}
              </AnimatePresence>
              <p className="mt-3.5 text-[12px] text-muted">
                Wash & bag textiles before drop-off; damp items can&apos;t enter fibre recycling. Keep the drawstring attached — hardware & trims are sorted automatically.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section F: Impact */}
      <section className="pt-10 sm:pt-16 pb-10 sm:pb-16 scroll-mt-28 sm:scroll-mt-32" id="section-f">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="flex items-center gap-[14px] sm:gap-[18px] mb-6 sm:mb-[30px]">
            <div className="w-10 h-10 sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">F</div>
            <div>
              <h2 className="text-[clamp(20px,3.4vw,30px)] font-bold tracking-tight">Environmental Dashboard</h2>
              <p className="text-muted text-[12.5px] sm:text-[13.5px] mt-0.5">Lifecycle assessment & resource efficiency metrics</p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-[26px]">
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[16px] font-bold">Carbon Footprint</h3>
                  <p className="text-[12.5px] text-muted mt-1">Lifecycle breakdown per ISO 14067</p>
                </div>
                <div className="px-3 py-1 bg-green-soft border border-[#BCD8C6] text-green-dark rounded-full font-bold text-[10px] tracking-widest uppercase">LCA Verified</div>
              </div>
              
              <CarbonPieChart />
              
              <div className="mt-4 pt-5 border-t border-line-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-muted/60">
                  <span>Source: LCA Ver 2.1</span>
                  <span>Date: 12 Aug 2025</span>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-[26px]">
              <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px]">
                <h3 className="text-[15px] font-bold mb-1 flex items-center gap-2">
                  <Leaf size={16} className="text-green" /> Resource Footprint
                </h3>
                <p className="text-[12.5px] text-muted mb-6">Benchmarked against industry standards</p>
                <ResourceBarChart />
              </Reveal>
              
              <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px]">
                <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
                  <Box size={16} className="text-green" /> Packaging Status
                </h3>
                <div className="grid gap-3">
                  <div className="bg-surface-2 border border-line rounded-xl p-3 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Recycle size={18} className="text-muted" />
                      <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Recyclability</span>
                    </div>
                    <span className="text-[13px] font-bold text-green-dark bg-green-soft px-3 py-1 rounded-full">100%</span>
                  </div>
                  <div className="p-3 text-[12px] leading-relaxed text-muted bg-surface-2 border border-line rounded-xl px-4">
                    <b className="text-ink">Materials:</b> Recycled Cardboard (FSC), Soy-based Inks, Organic Tissue Paper. Plastic-free shipment.
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* New Interactive Carbon Benchmark Indicator & Scale */}
          <Reveal className="mt-4 sm:mt-[26px]">
            <CarbonBenchmarkScale />
          </Reveal>
          
          <Reveal className="mt-8 bg-ink rounded-2xl p-6 border border-line flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-white font-bold text-[18px] mb-1">EU Policy Alignment Note</h3>
              <p className="text-white/60 text-[13px] max-w-[600px]">Product Environmental Footprint (PEF) methodology scoring pending final category framework release by the European Commission.</p>
            </div>
            <div className="relative z-10 shrink-0">
              <span className="px-5 py-2 bg-lime text-ink rounded-full font-bold text-[12px] tracking-widest uppercase shadow-lg shadow-lime/20">Data Pending</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section G: Data */}
      <section className="pt-10 sm:pt-16 pb-12 sm:pb-20 scroll-mt-28 sm:scroll-mt-32" id="section-g">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-[22px]">
          <Reveal className="flex items-center gap-[14px] sm:gap-[18px] mb-6 sm:mb-[30px]">
            <div className="w-10 h-10 sm:w-[58px] sm:h-[58px] shrink-0 rounded-xl sm:rounded-2xl bg-ink text-lime grid place-items-center font-display font-bold text-[18px] sm:text-[26px] shadow-custom">G</div>
            <div>
              <h2 className="text-[clamp(20px,3.4vw,30px)] font-bold tracking-tight">Data & Compliance</h2>
              <p className="text-muted text-[12.5px] sm:text-[13.5px] mt-0.5">Certifications and machine-readable export</p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-[26px] mb-4 sm:mb-[26px]">
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <h3 className="text-[16px] font-bold mb-4">Certifications & Audits</h3>
              <div className="grid gap-2.5">
                <div className="flex justify-between items-start bg-surface-2 border border-line rounded-xl p-3 sm:p-3.5">
                  <div>
                    <div className="font-bold text-[13px] sm:text-[13.5px]">Cotton made in Africa (CmiA)</div>
                    <div className="text-[11px] sm:text-[11.5px] text-muted mt-1">Scope: Raw cotton origin · Valid until Dec 2026</div>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-0.5 rounded-full">VERIFIED</span>
                </div>
                <div className="flex justify-between items-start bg-surface-2 border border-line rounded-xl p-3 sm:p-3.5">
                  <div>
                    <div className="font-bold text-[13px] sm:text-[13.5px]">OEKO-TEX® Standard 100</div>
                    <div className="text-[11px] sm:text-[11.5px] text-muted mt-1">Class I · Cert: 12345678 Hohenstein</div>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-0.5 rounded-full">VERIFIED</span>
                </div>
                <div className="flex justify-between items-start bg-surface-2 border border-line rounded-xl p-3 sm:p-3.5">
                  <div>
                    <div className="font-bold text-[13px] sm:text-[13.5px]">BSCI Social Audit</div>
                    <div className="text-[11px] sm:text-[11.5px] text-muted mt-1">Facility: AKH Knitting · Rating: A · June 12, 2025</div>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-0.5 rounded-full">VERIFIED</span>
                </div>
              </div>
            </Reveal>
            
            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[26px]">
              <h3 className="text-[16px] font-bold mb-4">Logistics & Lifecycle</h3>
              <div className="grid gap-2.5">
                <div className="flex justify-between items-center bg-surface-2 border border-line rounded-xl p-3 px-4">
                  <span className="text-[10px] tracking-widest uppercase text-muted font-semibold">Sales Channel</span>
                  <span className="font-mono text-[12px] font-bold text-ink">Online</span>
                </div>
                <div className="flex justify-between items-center bg-surface-2 border border-line rounded-xl p-3 px-4">
                  <span className="text-[10px] tracking-widest uppercase text-muted font-semibold">Available From</span>
                  <span className="font-mono text-[12px] font-bold text-ink">Nov 15, 2025</span>
                </div>
                <div className="flex justify-between items-center bg-surface-2 border border-line rounded-xl p-3 px-4">
                  <span className="text-[10px] tracking-widest uppercase text-muted font-semibold">Usage Class</span>
                  <span className="font-mono text-[12px] font-bold text-ink">Personal</span>
                </div>
                <div className="flex justify-between items-center bg-surface-2 border border-line rounded-xl p-3 px-4">
                  <span className="text-[10px] tracking-widest uppercase text-muted font-semibold">After-Sale Support</span>
                  <span className="font-mono text-[10px] font-bold text-ink text-right">Repair · Dry Cleaning</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="bg-surface border border-line rounded-[18px] shadow-custom p-[26px] flex flex-col">
              <h3 className="text-[16px] font-bold mb-1">Open Structured Data</h3>
              <p className="text-[12.5px] text-muted mb-4">Machine-readable DPP JSON export</p>
              <div className="flex-1 bg-ink text-[#B9C4BB] font-mono text-[11px] p-4 rounded-xl overflow-y-auto max-h-[220px]">
                <pre><code>{`{ "id": "DPP-151546", "version": "2.4" }`}</code></pre>
              </div>
              <button className="mt-4 w-full bg-green text-white font-semibold text-[13px] py-2.5 rounded-xl transition-colors hover:bg-green-dark flex justify-center items-center gap-2 cursor-pointer">
                <Download size={16} /> Download Full JSON
              </button>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  </main>

<footer className="bg-ink text-[#B9C4BB] py-[44px]">
  <div className="max-w-[1120px] mx-auto px-[22px] flex gap-[30px] flex-wrap justify-between items-start">
          <div className="max-w-[280px]">
            <div className="font-display font-bold text-lime text-[16px] tracking-[0.06em]">TCHIBO · DPP</div>
            <p className="mt-2.5 text-[12px] leading-[1.9]">Digital Product Passport compiled from FiTS v4 (25 Aug 2025) and Bureau Veritas test report (6825)298-0551 (30 Oct 2025). Overall result: PASS.</p>
          </div>
          <div>
            <h5 className="text-[#F4F1EA] text-[13px] tracking-widest uppercase mb-2.5 font-semibold">Record</h5>
            <ul className="font-mono text-[11px] leading-[1.9]">
              <li>Project: 151546 · Order: 4300085070</li>
              <li>Articles: 730793 – 730802</li>
              <li>FiTS: v4 updated · 25 Aug 2025</li>
              <li>Lab report: 30 Oct 2025</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[#F4F1EA] text-[13px] tracking-widest uppercase mb-2.5 font-semibold">Standards</h5>
            <ul className="text-[12px] leading-[1.9]">
              <li>ISO 1833 · DIN EN ISO 105 C06/E01/X12/B02/E04</li>
              <li>DIN EN ISO 14184-1 · EN ISO 14362-1 · ISO 22818</li>
              <li>EU 1007/2011 · REACh · Tchibo RSL Cat 1 v1/2024</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[#F4F1EA] text-[13px] tracking-widest uppercase mb-2.5 font-semibold">Data honesty</h5>
            <ul className="text-[12px] leading-[1.9]">
              <li>Farm-level cotton & elastane polymer</li>
              <li>origin currently out of scope — updates</li>
              <li>pushed to this passport via SCOT.</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1120px] mx-auto px-[22px] border-t border-[#2A362E] mt-[30px] pt-5 text-[11px] flex justify-between gap-3.5 flex-wrap">
          <span>Issuer: Tchibo GmbH, Überseering 18, 22297 Hamburg, Germany</span>
          <span>Markets: DE · AT · CZ · HU · SK · PL · CH · TR</span>
        </div>
      </footer>

      {/* Toast Notification */}
      <div className={`fixed bottom-[26px] left-1/2 -translate-x-1/2 bg-ink text-lime text-[12.5px] font-bold px-5 py-2.5 rounded-full pointer-events-none transition-all duration-300 z-50 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        Article number copied ✓
      </div>

      {/* Mini Measurement Map Floating Overlay */}
      <AnimatePresence>
        {showMiniOverlay && currentActiveDef && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[490px] z-50 bg-[#16221A]/95 text-white backdrop-blur-xl border border-white/15 rounded-[22px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-lime/20 text-lime grid place-items-center">
                  <Ruler size={13} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-bold tracking-wide">Measurement Inspector</span>
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-lime/20 text-lime">LIVE MAP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Garment Toggle in Overlay */}
                <div className="flex bg-black/40 border border-white/10 rounded-full p-[2px]">
                  <button
                    onClick={() => {
                      setCurGar('top');
                      setSelectedMeasurementKey('A');
                      setHoveredGar('g-t-chest');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${curGar === 'top' ? 'bg-lime text-ink' : 'text-white/70 hover:text-white'}`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => {
                      setCurGar('bottom');
                      setSelectedMeasurementKey('A');
                      setHoveredGar('g-b-waist');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${curGar === 'bottom' ? 'bg-lime text-ink' : 'text-white/70 hover:text-white'}`}
                  >
                    Bottom
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowMiniOverlay(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white grid place-items-center transition-colors cursor-pointer"
                  aria-label="Close measurement overlay"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body: Mini Map + Detailed Spec */}
            <div className="p-4 grid grid-cols-[135px_1fr] sm:grid-cols-[155px_1fr] gap-4 items-center">
              {/* Left: Mini SVG Map */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center relative">
                <GarmentMapSvg
                  garment={curGar}
                  activeKey={currentActiveDef.k}
                  onSelectKey={(k) => handleSelectMeasurement(k)}
                  isMini={true}
                />
                <div className="mt-1.5 text-[9.5px] font-mono text-lime/80 font-medium tracking-wide">
                  CLICK PIN TO SWITCH
                </div>
              </div>

              {/* Right: Spec details */}
              <div className="flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-lime text-ink font-mono text-[11px] font-bold grid place-items-center">
                        {currentActiveDef.k}
                      </span>
                      <h4 className="text-[14px] font-bold text-white leading-tight">{currentActiveDef.name}</h4>
                    </div>
                    <span className="text-[9.5px] font-mono text-white/60 bg-white/10 rounded px-1.5 py-0.5 shrink-0">
                      {currentActiveDef.how.split('·')[1]?.trim() || 'tol ±1.0 cm'}
                    </span>
                  </div>

                  {/* Dimension Value */}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-[22px] font-bold text-lime tracking-tight">
                      {fmt(currentActiveDef.vals[curSize] as number)}
                    </span>
                    <span className="text-[11px] text-white/60 font-mono">
                      (Size {curSize} · EU {EU[curSize]})
                    </span>
                  </div>

                  {/* Measurement guide instruction */}
                  <p className="text-[11px] text-white/75 leading-relaxed mt-1.5 line-clamp-2 font-normal">
                    {currentActiveDef.guide}
                  </p>
                </div>

                {/* Quick Controls: Size & Unit */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex gap-1">
                    {(['S','M','L','XL','XXL'] as Size[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setCurSize(s)}
                        className={`w-6 h-6 rounded-md text-[10.5px] font-mono font-bold transition-colors cursor-pointer ${curSize === s ? 'bg-lime text-ink' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-black/40 border border-white/10 rounded-full p-[2px]">
                    <button
                      onClick={() => setCurUnit('cm')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold cursor-pointer ${curUnit === 'cm' ? 'bg-white text-ink font-bold' : 'text-white/60'}`}
                    >
                      cm
                    </button>
                    <button
                      onClick={() => setCurUnit('in')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold cursor-pointer ${curUnit === 'in' ? 'bg-white text-ink font-bold' : 'text-white/60'}`}
                    >
                      in
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-t border-white/10 text-[11.5px]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMeasurement}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNextMeasurement}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <button
                onClick={() => scrollToSection('section-a')}
                className="text-lime/90 hover:text-lime font-mono text-[11px] underline underline-offset-2 cursor-pointer bg-transparent border-none"
              >
                Go to Section A ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
