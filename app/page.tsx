'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useSpring } from 'motion/react';
import Image from 'next/image';
import { 
  CheckCircle2, Download, Share, ShieldCheck, AlertCircle, User, 
  Droplets, Zap, Trash2, Box, Wind, Sun, Recycle, Leaf,
  X, ChevronLeft, ChevronRight, Ruler, Maximize2, Sparkles, Layers,
  TrendingDown, Scale, Car, Smartphone, TreePine, ArrowDownRight,
  ArrowRight, Navigation, Ship, Anchor, MapPin, BarChart3, BarChart2,
  PieChart, Activity, TrendingUp, SlidersHorizontal, ArrowUpRight, FileText, Check, Compass
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
  const [downloaded, setDownloaded] = useState(false);
  
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

  const handleDownloadQR = () => {
    const cv = canvasRef.current;
    if (!cv) return;

    try {
      // Generate a high-resolution 512x512 clean PNG with quiet margins
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 512;
      exportCanvas.height = 512;
      const exportCtx = exportCanvas.getContext('2d');

      if (exportCtx) {
        exportCtx.fillStyle = '#FFFFFF';
        exportCtx.fillRect(0, 0, 512, 512);
        exportCtx.imageSmoothingEnabled = false;
        exportCtx.drawImage(cv, 40, 40, 432, 432);

        const dataUrl = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'tchibo-dpp-qr-151546.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const dataUrl = cv.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'tchibo-dpp-qr-151546.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2200);
    } catch (err) {
      console.error('Error downloading QR code:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <canvas ref={canvasRef} width={92} height={92} className="rounded-lg border border-line bg-white shadow-xs" />
      <button
        type="button"
        id="download-qr-code-btn"
        onClick={handleDownloadQR}
        title="Download passport QR code as PNG image"
        className={`flex items-center justify-center gap-1.5 w-full py-1 px-2 rounded-lg text-[10.5px] font-mono font-semibold border transition-all cursor-pointer shadow-xs ${
          downloaded
            ? 'bg-green-soft text-green-dark border-[#BCD8C6]'
            : 'bg-surface-2 text-muted border-line-2 hover:bg-white hover:border-green hover:text-green-dark'
        }`}
      >
        {downloaded ? (
          <>
            <CheckCircle2 size={12} className="text-green-dark shrink-0" />
            <span>Saved PNG</span>
          </>
        ) : (
          <>
            <Download size={12} className="shrink-0" />
            <span>Download PNG</span>
          </>
        )}
      </button>
    </div>
  );
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
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  const data = [
    { 
      label: 'Water Usage', 
      real: 420, 
      standard: 1500, 
      max: 1600, 
      unit: 'L / set', 
      icon: Droplets, 
      color: '#22C55E', 
      sub: 'Rain-fed CmiA cotton vs irrigated benchmark',
      delta: '-72%',
      isBetter: true,
      note: 'Rain-fed African smallholders eliminate diesel-driven deep-well aquifer pumping'
    },
    { 
      label: 'Renewable Energy', 
      real: 65, 
      standard: 22, 
      max: 100, 
      unit: '% share', 
      icon: Zap, 
      color: '#EAB308', 
      sub: 'Rooftop solar at Tier 1 & biogenic heat at Tier 3',
      delta: '+195%',
      isBetter: true,
      note: 'AKH rooftop photovoltaic array + Birla biomass cogeneration'
    },
    { 
      label: 'Cellulosic Purity', 
      real: 95, 
      standard: 42, 
      max: 100, 
      unit: '% natural', 
      icon: Recycle, 
      color: '#10B981', 
      sub: '48% CmiA + 47% Modal (pure cellulosic loop)',
      delta: '+126%',
      isBetter: true,
      note: 'Enables high-efficiency mechanical and chemical fibre-to-fibre circularity'
    },
  ];

  return (
    <div className="grid gap-4 py-2">
      {data.map((item, i) => {
        const isSelected = selectedMetric === i;
        const realPercent = (item.real / item.max) * 100;
        const stdPercent = (item.standard / item.max) * 100;

        return (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            onClick={() => setSelectedMetric(isSelected ? null : i)}
            className={`border rounded-2xl p-4 transition-all cursor-pointer ${
              isSelected 
                ? 'bg-green-soft/70 border-green shadow-md' 
                : 'bg-surface-2 border-line hover:border-green/60 hover:bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-line grid place-items-center text-muted shadow-xs">
                  <item.icon size={18} strokeWidth={2.4} className="text-green-dark" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-ink leading-tight flex items-center gap-2">
                    {item.label}
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-green-soft text-green-dark border border-[#BCD8C6]">
                      {item.delta}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">{item.sub}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[17px] text-green-dark">
                  {item.real}
                  <small className="text-[11px] font-sans text-muted ml-1">{item.unit}</small>
                </span>
                <div className="text-[10px] font-mono text-muted/80">
                  std: {item.standard} {item.unit}
                </div>
              </div>
            </div>

            {/* Dual Comparative Progress Track */}
            <div className="space-y-1.5">
              {/* Real Measured Bar */}
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="w-14 font-mono font-bold text-green-dark text-[10px] shrink-0">REAL</span>
                <div className="relative flex-1 h-3 bg-muted/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${realPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "circOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green shadow-xs relative"
                  />
                </div>
                <span className="w-12 text-right font-mono font-bold text-ink text-[10.5px] shrink-0">{item.real}</span>
              </div>

              {/* Standard Baseline Bar */}
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="w-14 font-mono font-semibold text-muted text-[10px] shrink-0">STANDARD</span>
                <div className="relative flex-1 h-2 bg-muted/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stdPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.35 + i * 0.1, ease: "circOut" }}
                    className="h-full rounded-full bg-[#9EABA2] opacity-75"
                  />
                </div>
                <span className="w-12 text-right font-mono text-muted text-[10.5px] shrink-0">{item.standard}</span>
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-2.5 border-t border-green/20 text-[11.5px] text-green-dark font-medium flex items-center gap-1.5"
              >
                <Check size={13} className="shrink-0" />
                <span>{item.note}</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

interface ComparisonMetric {
  id: string;
  name: string;
  category: 'climate' | 'water' | 'materials' | 'circularity' | 'chemicals';
  realValue: number;
  standardValue: number;
  unit: string;
  displayReal: string;
  displayStd: string;
  deltaPercent: number;
  isReductionBetter: boolean;
  scoreIndexReal: number; // 0-100 normalized performance
  scoreIndexStd: number;  // 0-100 normalized performance
  source: string;
  icon: any;
  highlight: string;
}

const COMPARISON_DATA: ComparisonMetric[] = [
  {
    id: 'carbon',
    name: 'Carbon Footprint',
    category: 'climate',
    realValue: 4.8,
    standardValue: 11.5,
    unit: 'kg CO₂e',
    displayReal: '4.8 kg',
    displayStd: '11.5 kg',
    deltaPercent: -58.3,
    isReductionBetter: true,
    scoreIndexReal: 92,
    scoreIndexStd: 38,
    source: 'ISO 14067 LCA Study (Aug 2025)',
    icon: Wind,
    highlight: 'Rain-fed African smallholders + closed-loop solvent modal'
  },
  {
    id: 'water',
    name: 'Water Consumption',
    category: 'water',
    realValue: 420,
    standardValue: 1500,
    unit: 'Liters / set',
    displayReal: '420 L',
    displayStd: '1,500 L',
    deltaPercent: -72.0,
    isReductionBetter: true,
    scoreIndexReal: 95,
    scoreIndexStd: 28,
    source: 'CmiA Field Audit & Water Footprint Network',
    icon: Droplets,
    highlight: 'Zero artificial irrigation pumping electricity on cotton crops'
  },
  {
    id: 'renewable-energy',
    name: 'Clean Energy Share',
    category: 'climate',
    realValue: 65,
    standardValue: 22,
    unit: '% share',
    displayReal: '65 %',
    displayStd: '22 %',
    deltaPercent: 195.5,
    isReductionBetter: false,
    scoreIndexReal: 85,
    scoreIndexStd: 30,
    source: 'AKH Solar Grid Integration & Birla Heat Co-gen',
    icon: Zap,
    highlight: 'Solar array on knitwear plant roof & biomass process steam'
  },
  {
    id: 'cellulosic-purity',
    name: 'Recyclable Purity',
    category: 'circularity',
    realValue: 95,
    standardValue: 42,
    unit: '% mono-cellulosic',
    displayReal: '95 %',
    displayStd: '42 %',
    deltaPercent: 126.2,
    isReductionBetter: false,
    scoreIndexReal: 96,
    scoreIndexStd: 45,
    source: 'Fabric Composition Lab Test (Report 298-0551)',
    icon: Recycle,
    highlight: '48% CmiA Cotton + 47% Modal (95% natural cellulose fraction)'
  },
  {
    id: 'plastic-packaging',
    name: 'Packaging Plastic',
    category: 'materials',
    realValue: 0,
    standardValue: 48,
    unit: 'grams plastic',
    displayReal: '0 g (Zero)',
    displayStd: '48 g polybag',
    deltaPercent: -100.0,
    isReductionBetter: true,
    scoreIndexReal: 100,
    scoreIndexStd: 20,
    source: 'FSC Certified Paperband Specification',
    icon: Box,
    highlight: '100% plastic-free shipment with FSC paper band & organic tissue'
  },
  {
    id: 'chemical-safety',
    name: 'Chemical Safety Index',
    category: 'chemicals',
    realValue: 100,
    standardValue: 74,
    unit: '% MRSL pass',
    displayReal: '100% Pass',
    displayStd: '74% Avg Compliance',
    deltaPercent: 35.1,
    isReductionBetter: false,
    scoreIndexReal: 98,
    scoreIndexStd: 50,
    source: 'Bureau Veritas CPS Bangladesh (Zero RSL Detections)',
    icon: ShieldCheck,
    highlight: 'Full OEKO-TEX Standard 100 Class 1 & ZDHC MRSL Conformance'
  }
];

function RadarSpiderChart({ activeMetricId, onSelectMetric }: { activeMetricId: string | null; onSelectMetric: (id: string | null) => void }) {
  const radarMetrics = COMPARISON_DATA.slice(0, 5); // 5 pillars for clean pentagon
  const center = 150;
  const radius = 105;
  const numAxes = radarMetrics.length;

  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const realPoints = radarMetrics.map((m, i) => getCoordinates(m.scoreIndexReal, i));
  const stdPoints = radarMetrics.map((m, i) => getCoordinates(m.scoreIndexStd, i));

  const realPathD = realPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '') + ' Z';
  const stdPathD = stdPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '') + ' Z';

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Radar Polygon Canvas */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] shrink-0">
        <svg viewBox="0 0 300 300" className="w-full h-full select-none overflow-visible">
          <defs>
            <radialGradient id="realRadarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#15803D" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="stdRadarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0.08" />
            </radialGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Background Grid Rings (20%, 40%, 60%, 80%, 100%) */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((level, lIdx) => {
            const levelPoints = radarMetrics.map((_, i) => getCoordinates(level * 100, i));
            const path = levelPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '') + ' Z';
            return (
              <g key={lIdx}>
                <path
                  d={path}
                  fill="none"
                  stroke={lIdx === 4 ? '#CBD5E1' : '#E2E8F0'}
                  strokeWidth={lIdx === 4 ? '1.5' : '1'}
                  strokeDasharray={lIdx === 4 ? 'none' : '3 3'}
                />
                {/* Level Percentage Label */}
                <text
                  x={center + 4}
                  y={center - radius * level + 3}
                  fontSize="8"
                  fill="#94A3B8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {Math.round(level * 100)}%
                </text>
              </g>
            );
          })}

          {/* Radial Spokes / Axis Lines */}
          {radarMetrics.map((m, i) => {
            const endPt = getCoordinates(100, i);
            const isSelected = activeMetricId === m.id;
            return (
              <line
                key={m.id}
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke={isSelected ? '#15803D' : '#E2E8F0'}
                strokeWidth={isSelected ? '2' : '1'}
              />
            );
          })}

          {/* Standard Industry Polygon (Muted Gray Baseline) */}
          <motion.path
            d={stdPathD}
            fill="url(#stdRadarGrad)"
            stroke="#64748B"
            strokeWidth="2"
            strokeDasharray="4 3"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Real Measured Product Polygon (Vibrant Green Shape) */}
          <motion.path
            d={realPathD}
            fill="url(#realRadarGrad)"
            stroke="#15803D"
            strokeWidth="2.8"
            filter="url(#radarGlow)"
            initial={{ opacity: 0, scale: 0.3 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Standard Polygon Vertices (Small Gray Dots) */}
          {stdPoints.map((pt, i) => (
            <circle
              key={`std-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#64748B"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {/* Real Polygon Interactive Vertices (Glow Pins) */}
          {realPoints.map((pt, i) => {
            const m = radarMetrics[i];
            const isSelected = activeMetricId === m.id;
            return (
              <g
                key={`real-${i}`}
                className="cursor-pointer group"
                onClick={() => onSelectMetric(isSelected ? null : m.id)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 7 : 5}
                  fill="#22C55E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-transform duration-200"
                />
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="11"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Axis Labels Around Polygon Perimeter */}
          {radarMetrics.map((m, i) => {
            const pt = getCoordinates(120, i);
            const isSelected = activeMetricId === m.id;
            const textAnchor = pt.x < center - 10 ? 'end' : pt.x > center + 10 ? 'start' : 'middle';

            return (
              <g
                key={`label-${m.id}`}
                className="cursor-pointer"
                onClick={() => onSelectMetric(isSelected ? null : m.id)}
              >
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontWeight={isSelected ? '800' : '700'}
                  fill={isSelected ? '#15803D' : '#1E293B'}
                  className="transition-colors font-sans"
                >
                  {m.name}
                </text>
                <text
                  x={pt.x}
                  y={pt.y + 11}
                  textAnchor={textAnchor}
                  fontSize="8.5"
                  fontWeight="600"
                  fill="#22C55E"
                  fontFamily="monospace"
                >
                  {m.displayReal} ({m.deltaPercent > 0 ? `+${Math.round(m.deltaPercent)}%` : `${Math.round(m.deltaPercent)}%`})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Spider Legend & Detail Panel */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center justify-between p-3 bg-white border border-line rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-green border-2 border-white shadow-xs" />
            <span className="text-[12.5px] font-bold text-ink">This Product (Tchibo Verified DPP)</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-green-dark bg-green-soft px-2 py-0.5 rounded">
            Overall Score: 93.2 / 100
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-2 border border-line rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-[#64748B] border border-dashed border-white shadow-xs" />
            <span className="text-[12.5px] font-semibold text-muted">Conventional Industry Standard (EU Baseline)</span>
          </div>
          <span className="font-mono text-[11px] text-muted bg-white px-2 py-0.5 rounded border border-line">
            Benchmark: 36.2 / 100
          </span>
        </div>

        {/* Selected Pillar Deep Dive Card */}
        {activeMetricId ? (
          (() => {
            const active = COMPARISON_DATA.find(d => d.id === activeMetricId);
            if (!active) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-soft/70 border border-green rounded-xl shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-green-dark font-bold">
                    Pillar Spotlight: {active.name}
                  </span>
                  <span className="text-[12px] font-mono font-bold text-green-dark">
                    Index {active.scoreIndexReal} / 100 vs Standard {active.scoreIndexStd} / 100
                  </span>
                </div>
                <div className="text-[13px] font-bold text-ink mb-1">
                  Measured: {active.displayReal} <span className="text-muted font-normal">vs Conventional {active.displayStd}</span>
                </div>
                <p className="text-[11.5px] text-green-dark leading-relaxed">
                  {active.highlight} · <span className="underline">{active.source}</span>
                </p>
              </motion.div>
            );
          })()
        ) : (
          <div className="p-3 bg-surface-2 border border-dashed border-line-2 rounded-xl text-[12px] text-muted flex items-center gap-2">
            <Compass size={16} className="text-green shrink-0" />
            <span>Click any vertex or metric title on the radar chart to inspect real vs standard operational drivers.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DualBarGraphView({ activeCategory, activeMetricId, onSelectMetric }: { activeCategory: string; activeMetricId: string | null; onSelectMetric: (id: string | null) => void }) {
  const filteredMetrics = activeCategory === 'all'
    ? COMPARISON_DATA
    : COMPARISON_DATA.filter(m => m.category === activeCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredMetrics.map((metric, idx) => {
        const isSelected = activeMetricId === metric.id;
        const maxRef = Math.max(metric.realValue, metric.standardValue) * 1.2 || 100;
        const realBarWidth = (metric.realValue / maxRef) * 100;
        const stdBarWidth = (metric.standardValue / maxRef) * 100;

        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.07 }}
            onClick={() => onSelectMetric(isSelected ? null : metric.id)}
            className={`border rounded-2xl p-4.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-green-soft/70 border-green shadow-md -translate-y-0.5'
                : 'bg-white border-line shadow-xs hover:border-green/60 hover:shadow-sm'
            }`}
          >
            {/* Metric Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-soft text-green-dark grid place-items-center shrink-0 border border-[#BCD8C6]">
                  <metric.icon size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-ink leading-tight">
                    {metric.name}
                  </h4>
                  <span className="text-[10px] font-mono text-muted uppercase">
                    {metric.source.split('(')[0]}
                  </span>
                </div>
              </div>

              {/* Delta Advantage Badge */}
              <div className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border flex items-center gap-1 ${
                metric.isReductionBetter
                  ? 'bg-green-soft text-green-dark border-[#BCD8C6]'
                  : 'bg-green-soft text-green-dark border-[#BCD8C6]'
              }`}>
                {metric.deltaPercent > 0 ? (
                  <>
                    <TrendingUp size={12} className="shrink-0" />
                    <span>+{Math.round(metric.deltaPercent)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={12} className="shrink-0" />
                    <span>{Math.round(metric.deltaPercent)}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Side-by-Side Horizontal Grouped Bars */}
            <div className="space-y-2 mt-3 pt-2 border-t border-line/60">
              {/* 1. Real Measured Product Bar */}
              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="font-mono font-bold text-green-dark flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green inline-block" />
                    Real (This Product)
                  </span>
                  <span className="font-mono font-bold text-green-dark">
                    {metric.displayReal}
                  </span>
                </div>
                <div className="relative h-4 bg-muted/10 rounded-lg overflow-hidden flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(realBarWidth, 4)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.15 + idx * 0.08, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-emerald-600 via-green to-emerald-500 rounded-lg shadow-xs flex items-center justify-end pr-1.5"
                  >
                    <span className="text-[9px] font-mono font-bold text-white leading-none">
                      {metric.displayReal}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* 2. Industry Standard Baseline Bar */}
              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="font-mono font-semibold text-muted flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
                    Industry Standard
                  </span>
                  <span className="font-mono text-muted">
                    {metric.displayStd}
                  </span>
                </div>
                <div className="relative h-3.5 bg-muted/10 rounded-lg overflow-hidden flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(stdBarWidth, 4)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.25 + idx * 0.08, ease: "circOut" }}
                    className="h-full bg-[#94A3B8] rounded-lg opacity-80 flex items-center justify-end pr-1.5"
                  >
                    <span className="text-[8.5px] font-mono text-white leading-none">
                      {metric.displayStd}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Highlight Footer Note */}
            <div className="mt-3 pt-2 text-[11px] text-muted flex items-center justify-between gap-1 border-t border-line/40">
              <span className="truncate">{metric.highlight}</span>
              <span className="font-mono text-[10px] text-green-dark font-bold shrink-0">
                Score: {metric.scoreIndexReal}/100
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MatrixTableView() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-surface-2 border-b border-line text-[11px] font-mono uppercase text-muted font-bold tracking-wider">
            <th className="py-3 px-4">Metric & Scope</th>
            <th className="py-3 px-4">Real DPP Value</th>
            <th className="py-3 px-4">EU Industry Standard</th>
            <th className="py-3 px-4">Net Advantage</th>
            <th className="py-3 px-4">Audit Protocol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line font-medium">
          {COMPARISON_DATA.map((item) => (
            <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
              <td className="py-3 px-4 font-bold text-ink flex items-center gap-2">
                <item.icon size={15} className="text-green shrink-0" />
                <span>{item.name}</span>
              </td>
              <td className="py-3 px-4 font-mono font-bold text-green-dark bg-green-soft/40">
                {item.displayReal}
              </td>
              <td className="py-3 px-4 font-mono text-muted">
                {item.displayStd}
              </td>
              <td className="py-3 px-4 font-mono">
                <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-green-soft text-green-dark border border-[#BCD8C6]">
                  {item.deltaPercent > 0 ? `+${item.deltaPercent.toFixed(1)}%` : `${item.deltaPercent.toFixed(1)}%`}
                </span>
              </td>
              <td className="py-3 px-4 text-[11px] text-muted font-mono truncate max-w-[220px]">
                {item.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RealVsStandardComparison() {
  const [viewMode, setViewMode] = useState<'bars' | 'radar' | 'scale' | 'matrix'>('bars');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);

  const productCO2 = 4.8;
  const industryCO2 = 11.5;
  const highCarbonCO2 = 15.8;
  const maxScale = 18;
  
  const productPos = (productCO2 / maxScale) * 100;
  const industryPos = (industryCO2 / maxScale) * 100;
  const highPos = (highCarbonCO2 / maxScale) * 100;
  const deltaSavings = (industryCO2 - productCO2).toFixed(1);
  const percentSavings = Math.round(((industryCO2 - productCO2) / industryCO2) * 100);

  const savedCO2PerBatch = ((industryCO2 - productCO2) * batchMultiplier).toFixed(1);
  const savedWaterPerBatch = ((1500 - 420) * batchMultiplier).toLocaleString();
  const savedPlasticPerBatch = ((48 * batchMultiplier) / 1000).toFixed(2);

  return (
    <div className="bg-surface border border-line rounded-[22px] shadow-custom p-5 sm:p-[28px] relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-line">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-green-soft text-green-dark border border-[#BCD8C6] grid place-items-center shrink-0 shadow-xs">
            <Scale size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-ink">
                Real vs Standard Benchmark Analysis
              </h3>
              <span className="bg-green-soft border border-[#BCD8C6] text-green-dark text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                -{percentSavings}% Total Impact
              </span>
            </div>
            <p className="text-[12.5px] text-muted mt-0.5">
              Verified measurement from Tchibo production data vs European conventional industry averages
            </p>
          </div>
        </div>

        {/* Chart View Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-surface-2 border border-line rounded-xl p-1 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setViewMode('bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'bars' ? 'bg-white text-ink shadow-sm border border-line' : 'text-muted hover:text-ink'
            }`}
          >
            <BarChart3 size={14} className="shrink-0" />
            <span>Dual Bar Chart</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'radar' ? 'bg-white text-ink shadow-sm border border-line' : 'text-muted hover:text-ink'
            }`}
          >
            <Compass size={14} className="shrink-0" />
            <span>Radar Spider Chart</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('scale')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'scale' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            <SlidersHorizontal size={14} className="shrink-0" />
            <span>Scale & Drivers</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'matrix' ? 'bg-white text-ink shadow-sm border border-line' : 'text-muted hover:text-ink'
            }`}
          >
            <FileText size={14} className="shrink-0" />
            <span>Matrix Table</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (When in Bar View) */}
      {viewMode === 'bars' && (
        <div className="flex items-center gap-2 pt-4 pb-2 flex-wrap">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider font-semibold">Filter:</span>
          {[
            { id: 'all', label: 'All 6 Indicators' },
            { id: 'climate', label: 'Climate & Energy' },
            { id: 'water', label: 'Water Stewardship' },
            { id: 'circularity', label: 'Circularity' },
            { id: 'chemicals', label: 'Chemical Safety' },
            { id: 'materials', label: 'Packaging' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-ink text-lime border-ink shadow-xs font-bold'
                  : 'bg-white text-muted border-line hover:border-line-2 hover:text-ink'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Dynamic View Content */}
      <div className="pt-5">
        {viewMode === 'bars' && (
          <DualBarGraphView
            activeCategory={activeCategory}
            activeMetricId={activeMetricId}
            onSelectMetric={setActiveMetricId}
          />
        )}

        {viewMode === 'radar' && (
          <div className="bg-surface-2 border border-line rounded-2xl p-5 sm:p-6">
            <div className="mb-4">
              <h4 className="text-[14.5px] font-bold text-ink">5-Pillar Sustainability Radar Comparison</h4>
              <p className="text-[12px] text-muted mt-0.5">Visualizing performance index (0-100) across key ecological and ethical criteria.</p>
            </div>
            <RadarSpiderChart
              activeMetricId={activeMetricId}
              onSelectMetric={setActiveMetricId}
            />
          </div>
        )}

        {viewMode === 'scale' && (
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
              <div className="bg-green-soft/40 border-2 border-green/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-green-dark bg-green-soft border border-[#BCD8C6] px-2 py-0.5 rounded-md uppercase">
                      This Product (Real Data)
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

              <div className="bg-surface-2 border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-muted bg-white border border-line px-2 py-0.5 rounded-md uppercase">
                      Industry Baseline (Standard)
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

        {viewMode === 'matrix' && (
          <MatrixTableView />
        )}
      </div>

      {/* Batch Savings Calculator & Real-World Equivalents Bar */}
      <div className="mt-6 pt-5 border-t border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-[14px] font-bold text-ink flex items-center gap-2">
              <Sparkles size={16} className="text-green" />
              Cumulative Impact Multiplier
            </h4>
            <p className="text-[12px] text-muted">Explore how savings compound over customer orders or retail batch volume.</p>
          </div>
          
          {/* Quick Volume Multiplier Selectors */}
          <div className="flex items-center gap-1.5 bg-surface-2 border border-line rounded-lg p-1">
            {[
              { label: '1 Unit', val: 1 },
              { label: '10 Sets', val: 10 },
              { label: '100 Sets', val: 100 },
              { label: '12,000 (PO Batch)', val: 12000 },
            ].map(m => (
              <button
                key={m.val}
                type="button"
                onClick={() => setBatchMultiplier(m.val)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  batchMultiplier === m.val
                    ? 'bg-ink text-lime shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Cumulative Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-2 border border-line rounded-xl p-3.5 text-center">
            <div className="w-7 h-7 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-1.5">
              <Wind size={15} className="text-green-dark" />
            </div>
            <div className="font-mono text-[16px] sm:text-[18px] font-bold text-green-dark">{savedCO2PerBatch} kg</div>
            <div className="text-[10.5px] text-muted mt-0.5">CO₂e emissions avoided</div>
          </div>

          <div className="bg-surface-2 border border-line rounded-xl p-3.5 text-center">
            <div className="w-7 h-7 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-1.5">
              <Droplets size={15} className="text-green-dark" />
            </div>
            <div className="font-mono text-[16px] sm:text-[18px] font-bold text-green-dark">{savedWaterPerBatch} L</div>
            <div className="text-[10.5px] text-muted mt-0.5">Freshwater conserved</div>
          </div>

          <div className="bg-surface-2 border border-line rounded-xl p-3.5 text-center">
            <div className="w-7 h-7 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-1.5">
              <Box size={15} className="text-green-dark" />
            </div>
            <div className="font-mono text-[16px] sm:text-[18px] font-bold text-green-dark">{savedPlasticPerBatch} kg</div>
            <div className="text-[10.5px] text-muted mt-0.5">Polybag plastic prevented</div>
          </div>

          <div className="bg-surface-2 border border-line rounded-xl p-3.5 text-center">
            <div className="w-7 h-7 rounded-full bg-white border border-line mx-auto grid place-items-center text-muted mb-1.5">
              <Car size={15} className="text-green-dark" />
            </div>
            <div className="font-mono text-[16px] sm:text-[18px] font-bold text-green-dark">
              {(Number(savedCO2PerBatch) * 4.15).toFixed(0)} km
            </div>
            <div className="text-[10.5px] text-muted mt-0.5">Car travel equivalent avoided</div>
          </div>
        </div>
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

interface MapWaypoint {
  id: string;
  name: string;
  role: string;
  location: string;
  top: string;
  left: string;
  type: 'origin' | 'waypoint' | 'destination';
  detail: string;
}

const MAP_WAYPOINTS: MapWaypoint[] = [
  {
    id: 'origin',
    name: 'Chittagong Port / Dhaka',
    role: 'Tier 1 & Tier 2 Origin',
    location: 'Bangladesh 🇧🇩',
    top: '45.2%',
    left: '74.8%',
    type: 'origin',
    detail: 'AKH Knitting & Dyeing Ltd. · CMT Garment Assembly & Lab Testing release'
  },
  {
    id: 'arabian-sea',
    name: 'Indian Ocean Corridor',
    role: 'Maritime Transit',
    location: 'South Asian Sea',
    top: '55.5%',
    left: '64.5%',
    type: 'waypoint',
    detail: 'Low-speed fuel-efficient maritime freight navigation'
  },
  {
    id: 'suez',
    name: 'Suez Canal Pass',
    role: 'Key Waypoint',
    location: 'Red Sea / Egypt 🇪🇬',
    top: '38.2%',
    left: '51.5%',
    type: 'waypoint',
    detail: 'Direct shipping transit linking Indian Ocean to Mediterranean Sea'
  },
  {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    role: 'Maritime Transit',
    location: 'Atlantic Gate 🇪🇸/🇲🇦',
    top: '41.2%',
    left: '43.2%',
    type: 'waypoint',
    detail: 'Atlantic route toward North Sea distribution corridors'
  },
  {
    id: 'destination',
    name: 'Port of Hamburg',
    role: 'Central EU Destination',
    location: 'Germany 🇩🇪',
    top: '34.8%',
    left: '41.0%',
    type: 'destination',
    detail: 'Tchibo Central Distribution Center · Regional logistics for DE, AT, CZ, PL, CH'
  }
];

function OriginMap() {
  const [activePoint, setActivePoint] = useState<MapWaypoint | null>(null);

  // SVG route path connecting Chittagong (748, 190) -> Arabian Sea (645, 233) -> Suez (515, 160) -> Gibraltar (432, 173) -> Hamburg (410, 146)
  const ROUTE_PATH = "M 748 190 C 700 236, 645 244, 570 205 C 538 185, 524 168, 515 160 C 478 146, 448 182, 432 173 C 418 165, 412 153, 410 146";

  return (
    <div className="relative bg-[#EAE6DA] border border-line rounded-[18px] overflow-hidden mb-6 shadow-custom group">
      {/* Background World/Regional Map */}
      <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full overflow-hidden">
        <Image 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAROjOi-Bf2EcETjYQMYUiQFiGvpbNnne4KfaHBiXJYvdh3thocx7W06GEve67XMqCacKpZItN7RPP7TRmKEsKIPbkMSJD3aREJ794POQ-yTiMDoJgxsFCVToMqjCwI9jrej_9nVi_8NCHh4soGenyWEdF31wyv2Dw0rljUeY_oGR1uumoaX9IXdst2MPeKmJD46dZwGzKn-G1DSTtHqDlUgAQN7zhLnpoa7LCJ8hW2awbgSxx_n0J"
          alt="Supply Chain Maritime Route Map"
          fill
          className="object-cover opacity-85 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/30 via-transparent to-black/10 pointer-events-none" />

        {/* SVG Route Overlay with Vibrant Red Gradient & Animated Stroke-Dashoffset */}
        <svg 
          viewBox="0 0 1000 420" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          <defs>
            {/* Vibrant Red Linear Gradient along the travel corridor */}
            <linearGradient id="vibrantRedGrad" x1="100%" y1="60%" x2="0%" y2="40%">
              <stop offset="0%" stopColor="#FF1E42" />
              <stop offset="28%" stopColor="#FF3366" />
              <stop offset="65%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#E60026" />
            </linearGradient>

            {/* Glowing Red Drop Gradient for the under-glow effect */}
            <linearGradient id="vibrantRedGlow" x1="100%" y1="60%" x2="0%" y2="40%">
              <stop offset="0%" stopColor="#FF1E42" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FF385C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E60026" stopOpacity="0.6" />
            </linearGradient>

            {/* Smooth Gaussian Glow filter for vibrant route illumination */}
            <filter id="routeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Radial glow for origin/destination beacons */}
            <radialGradient id="beaconGlowOrigin">
              <stop offset="0%" stopColor="#FF1E42" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF1E42" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="beaconGlowDest">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Underlying Luminous Aura Glow */}
          <motion.path
            d={ROUTE_PATH}
            fill="none"
            stroke="url(#vibrantRedGlow)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#routeGlowFilter)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.85 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* 2. Soft Background Reference Track */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(255, 30, 66, 0.22)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Primary Animated Dashed Line with SVG stroke-dashoffset motion */}
          <motion.path
            d={ROUTE_PATH}
            fill="none"
            stroke="url(#vibrantRedGrad)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="9 7"
            initial={{ strokeDashoffset: 0 }}
            animate={{
              strokeDashoffset: [0, -32],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* 4. Secondary Fast-moving Light Pulses across the vector */}
          <motion.path
            d={ROUTE_PATH}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="4 28"
            initial={{ strokeDashoffset: 0, opacity: 0.7 }}
            animate={{
              strokeDashoffset: [0, -64],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              strokeDashoffset: { duration: 2.2, repeat: Infinity, ease: "linear" },
              opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* 5. Autonomous Moving Vessel Beacon along the Route */}
          <g>
            <circle r="5" fill="#FFFFFF" stroke="#FF1E42" strokeWidth="2.5" filter="url(#routeGlowFilter)">
              <animateMotion
                path={ROUTE_PATH}
                dur="8s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
            <circle r="9" fill="none" stroke="#FF1E42" strokeWidth="1.2" opacity="0.6">
              <animateMotion
                path={ROUTE_PATH}
                dur="8s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
          </g>
        </svg>

        {/* Interactive Waypoint Markers on the Map */}
        {MAP_WAYPOINTS.map((wp) => {
          const isOrigin = wp.type === 'origin';
          const isDest = wp.type === 'destination';
          const isHovered = activePoint?.id === wp.id;

          return (
            <div
              key={wp.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin"
              style={{ top: wp.top, left: wp.left }}
              onMouseEnter={() => setActivePoint(wp)}
              onMouseLeave={() => setActivePoint(null)}
              onClick={() => setActivePoint(activePoint?.id === wp.id ? null : wp)}
            >
              {/* Outer Pulsing Wave Ring */}
              <motion.div
                animate={{
                  scale: isOrigin || isDest ? [1, 2.8] : [1, 2.2],
                  opacity: isOrigin || isDest ? [0.75, 0] : [0.5, 0],
                }}
                transition={{
                  duration: isOrigin || isDest ? 2.1 : 2.6,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: isDest ? 0.8 : 0
                }}
                className={`absolute inset-0 rounded-full ${
                  isDest ? 'bg-emerald-500' : 'bg-red'
                }`}
              />

              {/* Pin Core */}
              <div 
                className={`relative rounded-full transition-transform duration-300 shadow-md flex items-center justify-center ${
                  isOrigin 
                    ? 'w-4 h-4 bg-red border-2 border-white ring-2 ring-red/40 scale-110' 
                    : isDest
                    ? 'w-4 h-4 bg-emerald-600 border-2 border-white ring-2 ring-emerald-500/40 scale-110'
                    : 'w-2.5 h-2.5 bg-red-600 border-[1.5px] border-white/90'
                } ${isHovered ? 'scale-125 ring-4' : ''}`}
              >
                {(isOrigin || isDest) && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>

              {/* Static Anchor Label Tag for Origin & Destination */}
              {(isOrigin || isDest) && (
                <div 
                  className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap hidden sm:flex flex-col items-center z-30 transition-all ${
                    isHovered ? 'scale-105' : 'opacity-90'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold tracking-wider shadow-sm border ${
                    isOrigin
                      ? 'bg-red text-white border-red-dark shadow-red/20'
                      : 'bg-emerald-700 text-white border-emerald-800 shadow-emerald/20'
                  }`}>
                    {isOrigin ? 'ORIGIN · BD' : 'DESTINATION · DE'}
                  </div>
                </div>
              )}

              {/* Interactive Tooltip Card on Hover / Tap */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 bg-ink/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl border border-white/15 z-40 text-left pointer-events-none"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-lime font-semibold">
                        {wp.role}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 font-medium">
                        {wp.location}
                      </span>
                    </div>
                    <div className="text-[12px] font-bold text-white leading-tight">
                      {wp.name}
                    </div>
                    <p className="text-[10.5px] text-white/75 mt-1 leading-snug">
                      {wp.detail}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-ink/95" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Top-Left Floating Header Badge: Route Summary */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-line shadow-custom z-20 max-w-[280px] sm:max-w-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold text-ink flex-wrap">
              <span>Chittagong, BD</span>
              <ArrowRight size={13} className="text-red shrink-0" />
              <span>Hamburg, DE</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-[11px] text-muted font-mono">
            <span className="flex items-center gap-1">
              <Ship size={11} className="text-muted/80" /> ~14,500 km
            </span>
            <span>·</span>
            <span>Sea Freight Corridor</span>
            <span>·</span>
            <span className="text-green-dark font-semibold">0.4 kg CO₂e</span>
          </div>
        </div>

        {/* Bottom-Left Live Route Indicator */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-line shadow-sm z-20">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
            </span>
            <span className="text-[9px] sm:text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono">
              Live Animated Route (Red Gradient)
            </span>
          </div>
        </div>

        {/* Bottom-Right Verified Journey Status Pill */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-ink/90 backdrop-blur-md text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border border-white/10 shadow-sm z-20 hidden sm:flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono text-lime font-semibold">
            SCOT Custody: VERIFIED
          </span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-[10px] sm:text-[11px] font-mono text-white/80">
            Transit: ~26 Days
          </span>
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

interface MilestoneSpec {
  label: string;
  value: string;
  isHighlight?: boolean;
}

interface MilestoneData {
  id: string;
  stepNum: number;
  tier: string;
  date: string;
  title: string;
  subtitle: string;
  status: 'verified' | 'pending';
  statusBadge: string;
  specs: MilestoneSpec[];
  callout?: { text: string; type: 'amber' | 'green' };
}

const TRACEABILITY_MILESTONES: MilestoneData[] = [
  {
    id: 'tier-3',
    stepNum: 1,
    tier: 'TIER 3',
    date: 'Q3 2025',
    title: 'Yarn & Fibre Sourcing — CmiA · Birla · Hyosung',
    subtitle: 'Cotton made in Africa partner countries · Birla Modal (cellulosic) · creora® elastane (Hyosung) · SCOT-tracked chain',
    status: 'pending',
    statusBadge: 'PARTIAL VERIFIED',
    specs: [
      { label: 'SCOT Registration', value: 'ID: PENDING (AKH-B01)' },
      { label: 'Cotton 48%', value: 'CmiA certified, ring-spun Ne 34/1 combed, S-twist' },
      { label: 'Modal 47%', value: 'Nominated Birla fibres (Livaeco™ eligible)' },
      { label: 'Elastane 5%', value: 'creora® 20 D · certificate issued by Hyosung' },
    ],
    callout: {
      text: 'Raw cotton fibre (farm-level) origin: Data Pending / Out of Scope — SCOT chain verified at spinning-mill level only',
      type: 'amber'
    }
  },
  {
    id: 'tier-2',
    stepNum: 2,
    tier: 'TIER 2',
    date: 'SEP 2025',
    title: 'Fabric Manufacturing — AKH Knitting & Dyeing Ltd.',
    subtitle: '🇧🇩 Bangladesh · knitting, dyeing & finishing in-house · Birla fibre declaration + invoice on file',
    status: 'verified',
    statusBadge: 'VERIFIED NODE',
    specs: [
      { label: 'Knitting', value: 'Single jersey, gauge 32×28 · 42 courses / 30 wales per 2 cm' },
      { label: 'Dyeing', value: 'Jadeite 16-5304 TCX · Dark Green 097-36-06 · AOP pigment print (base 085-52-07)' },
      { label: 'Finishing', value: 'Softener finish · 160 g/m² ±5%' },
    ]
  },
  {
    id: 'tier-1',
    stepNum: 3,
    tier: 'TIER 1',
    date: 'OCT 2025',
    title: 'Garment Assembly — AKH Knitting and Dyeing Ltd. (CMT)',
    subtitle: '🇧🇩 Bangladesh · Cut, Make & Trim · order 4300085070 · AQL release KF 0 / HF 2.5 / NF 4.0',
    status: 'verified',
    statusBadge: 'VERIFIED NODE',
    specs: [
      { label: 'Top', value: 'V-neck self-fabric piping, necktape chain-stitched, shoulder +2 cm forward' },
      { label: 'Bottom', value: 'Set-on waistband w/ drawstring + elastic, side pockets, fake fly "J" stitch' },
      { label: 'Seams', value: '4-thread overlock · 3-thread coverstitch hem 2.5 cm · ≥ 5 st/cm knitwear' },
    ]
  },
  {
    id: 'lab',
    stepNum: 4,
    tier: 'LAB',
    date: '30 OCT 2025',
    title: 'Testing & Release — Bureau Veritas CPS (BD) Ltd.',
    subtitle: '🇧🇩 Plot #130, DEPZ Extension Area, Ganakbari, Savar, Dhaka · Report (6825)298-0551 · reviewed by R. Belal Hossain, Sr. Manager',
    status: 'verified',
    statusBadge: 'CERTIFIED PASS',
    specs: [
      { label: 'Scope', value: 'RSL Cat 1 v1/2024 + Tchibo physical tests (FiTS 13 Aug 2025)' },
      { label: 'Overall result', value: 'PASS — complies with FiTS & EU legal requirements', isHighlight: true },
      { label: 'Destination', value: 'DE · AT · CZ · HU · SK · PL · CH · TR' },
    ]
  },
  {
    id: 'logistics',
    stepNum: 5,
    tier: 'LOGISTICS',
    date: 'NOV 2025',
    title: 'Transport & Distribution',
    subtitle: 'Shipment to European distribution centers and final retail.',
    status: 'verified',
    statusBadge: 'TRACKED TRANSIT',
    specs: [
      { label: 'Origin → Destination', value: 'Chittagong, BD → Hamburg, DE' },
      { label: 'Mode', value: 'Sea Freight (~14,500 km)' },
      { label: 'Emissions Profile', value: '0.4 kg CO₂e per unit allocated' },
    ]
  }
];

function TraceabilityTimeline() {
  return (
    <div className="relative pl-7 sm:pl-[38px] grid gap-5 sm:gap-6 mb-3.5">
      {/* Background Static Track Line */}
      <div className="absolute left-[11px] sm:left-[13px] top-6 bottom-8 w-[2.5px] bg-line-2/70 rounded-full" />

      {/* Dynamic Animated Gradient Track that fills on viewport entry */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-20px', amount: 0.05 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ originY: 0 }}
        className="absolute left-[11px] sm:left-[13px] top-6 bottom-8 w-[2.5px] bg-gradient-to-b from-amber via-green to-green-dark rounded-full shadow-xs z-0"
      />

      {TRACEABILITY_MILESTONES.map((item) => {
        const isPending = item.status === 'pending';

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 44, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px', amount: 0.12 }}
            transition={{
              duration: 0.65,
              ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className="relative group/milestone"
          >
            {/* Pulsing Beacon Marker on the Timeline Track */}
            <div className="absolute -left-[31px] sm:-left-[35px] top-[22px] z-10">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 320, damping: 18 }}
                className="relative"
              >
                {/* Expanding Radar Wave Effect */}
                <motion.div
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.75, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: item.stepNum * 0.25
                  }}
                  className={`absolute -inset-1 rounded-full ${
                    isPending ? 'bg-amber' : 'bg-green'
                  }`}
                />

                {/* Node Center Pin */}
                <div
                  className={`relative w-[18px] h-[18px] rounded-full border-[3px] border-bg flex items-center justify-center shadow-md transition-transform duration-300 group-hover/milestone:scale-125 ${
                    isPending
                      ? 'bg-amber ring-2 ring-amber/50'
                      : 'bg-green ring-2 ring-green/50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                </div>
              </motion.div>
            </div>

            {/* Milestone Card with Staggered Elements & Hover Lift */}
            <div className="bg-surface border border-line rounded-[18px] shadow-custom p-5 sm:p-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green/50">
              {/* Card Header Row */}
              <div className="flex items-center justify-between gap-2.5 flex-wrap mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold bg-ink text-lime rounded-lg px-2.5 py-1 tracking-[0.08em] shadow-xs">
                    {item.tier}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted bg-surface-2 px-2 py-0.5 rounded-md border border-line">
                    {item.date}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-muted/80">
                    Step {item.stepNum} of 5
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isPending
                      ? 'bg-amber-soft text-amber border-amber-line'
                      : 'bg-green-soft text-green-dark border-[#BCD8C6]'
                  }`}>
                    {item.statusBadge}
                  </span>
                  <span className="text-line-2 text-[14px]">⟰</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-[16.5px] sm:text-[17.5px] font-bold text-ink leading-snug">
                {item.title}
              </h3>
              <p className="text-[12.5px] sm:text-[13px] text-muted my-1.5 mb-3.5 leading-relaxed">
                {item.subtitle}
              </p>

              {/* Spec Blocks Grid */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                {item.specs.map((spec, sIdx) => (
                  <div 
                    key={sIdx}
                    className="bg-surface-2 border border-line rounded-xl p-2.5 px-3 transition-colors hover:bg-white hover:border-line-2"
                  >
                    <div className="text-[10px] tracking-widest uppercase text-muted font-semibold">
                      {spec.label}
                    </div>
                    <div className={`text-[12.5px] mt-0.5 leading-snug ${
                      spec.isHighlight ? 'font-bold text-green-dark' : 'font-semibold text-ink'
                    }`}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Callout Notice */}
              {item.callout && (
                <div className="mt-3.5 bg-amber-soft border border-dashed border-amber-line text-amber text-[12px] font-semibold rounded-xl px-3.5 py-2.5 flex items-start gap-2 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-amber shrink-0 mt-1.5" />
                  <span>{item.callout.text}</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
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

          {/* Traceability Journey Milestones with Bottom-to-Top On-Scroll Sequential Reveal Animation */}
          <TraceabilityTimeline />
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

          {/* Real vs Standard Multi-Visual Benchmark Comparison System */}
          <Reveal className="mt-4 sm:mt-[26px]">
            <RealVsStandardComparison />
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
