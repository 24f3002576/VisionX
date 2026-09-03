import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'scanned_inspection_approval',
    title: 'Inspection Report Analysis',
    category: 'Document Analysis',
    taskType: 'doc_inspection',
    description: 'Ingest ultrasonic inspection report for DHDT Reactor Cooler (44-E-102B), extract wall thickness, calculate remaining service life (API 579), and draft an approval note for ₹42.5 Lakhs retubing.',
    suggestedPrompt: 'Analyze the inspection report for Unit 44 REAC-02B. Extract minimum wall thickness, calculate remaining life under API 579, and draft an approval note for ₹42.5 Lakhs retubing.',
    inputFiles: [
      {
        name: 'MRPL_NDT_UTG_REAC_44-E-102B_Scan.pdf',
        type: 'Scanned PDF',
        size: '3.4 MB',
        description: 'Ultrasonic thickness report with technician measurements and corrosion logs.'
      }
    ],
    expectedModel: 'qwen-2.5-32b',
    routerReason: 'OCR routed to Qwen2.5-VL, chained with Qwen2.5-32B for remaining life calculations and note drafting.',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'thought',
        title: 'Initialize Agent Pipeline',
        content: 'Starting local ReAct agent loop in isolated sandbox with zero external network access.',
        status: 'completed',
        durationMs: 420,
        timestamp: '10:58:02'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'action',
        title: 'Run OCR & Extract Thickness',
        content: 'Running Qwen2.5-VL OCR on MRPL_NDT_UTG_REAC_44-E-102B_Scan.pdf',
        tool: 'local_ocr_extractor',
        toolInput: { file: 'MRPL_NDT_UTG_REAC_44-E-102B_Scan.pdf', targetEntities: ['Nominal Thickness', 'Min Thickness', 'Corrosion Rate'] },
        toolOutput: 'EXTRACTED DATA:\n- Equipment: 44-E-102B (DHDT REAC Bay 2)\n- Material: Duplex SS 2205 (UNS S31803)\n- Nominal Wall (t_nom): 3.20 mm\n- Min Measured Wall (t_act): 1.62 mm (Row 4 / Tube 38)\n- Base Corrosion Rate: 0.38 mm/yr\n- Design Pressure: 42.0 bar(g)',
        status: 'completed',
        durationMs: 1250,
        timestamp: '10:58:03'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'action',
        title: 'Calculate Remaining Life (API 579)',
        content: 'Executing local Python script in isolated sandbox to calculate minimum retirement thickness and remaining life.',
        tool: 'sandboxed_python_runner',
        toolInput: { script: 't_min = (P * D) / (2 * S * E + 0.4 * P)\nRL = (t_act - t_min) / Cr\nprint(f"t_min: {t_min:.3f} mm, RL: {RL:.2f} years")' },
        toolOutput: 'SANDBOX LOG [Zero Egress]:\n- Calculated t_min (Retirement Thickness): 1.340 mm\n- Calculated Remaining Life (RL): 0.74 years (8.8 months)\n- STATUS: RL < 24-month turnaround cycle. Retubing mandatory before monsoon shutdown.',
        status: 'completed',
        durationMs: 640,
        timestamp: '10:58:05'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        type: 'action',
        title: 'Search Financial Powers Limit',
        content: 'Querying local vector database for emergency maintenance sanction clauses.',
        tool: 'local_rag_search',
        toolInput: { query: 'Emergency shutdown replacement tube bundle procurement approval authority limit' },
        toolOutput: 'Retrieved from MRPL-DoFP-2024.pdf (Clause 7.4.2):\n"For emergency maintenance expenditure up to ₹50.00 Lakhs directly impacting plant reliability, General Manager has full delegated sanction power with finance concurrence."',
        status: 'completed',
        durationMs: 380,
        timestamp: '10:58:06'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        type: 'deliverable',
        title: 'Generate Approval Note Sheet',
        content: 'Generated official approval note with engineering justifications and budget sanction.',
        status: 'verified',
        durationMs: 1400,
        timestamp: '10:58:07'
      }
    ],
    visionAnnotations: [
      {
        tag: 'Row 4 / Tube 38',
        type: 'defect',
        x: 28,
        y: 35,
        w: 24,
        h: 20,
        description: 'Localized pitting wear. Measured wall thickness 1.62 mm (Min retirement limit: 1.34 mm).',
        severity: 'CRITICAL'
      },
      {
        tag: 'Inlet Nozzle N1',
        type: 'instrument',
        x: 65,
        y: 20,
        w: 18,
        h: 18,
        description: 'Duplex SS inlet header nozzle (42 bar g design pressure).',
        severity: 'NOMINAL'
      }
    ],
    deliverables: [
      {
        id: 'deliv-1',
        title: 'Approval Note Sheet (Form 42-B)',
        type: 'docx',
        fileName: 'MRPL_APPROVAL_NOTE_REAC_44-E-102B.docx',
        summary: 'Official Approval Note with API 579 engineering calculations and ₹42,50,000/- sanction proposal.',
        content: `================================================================================
MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)
NOTE SHEET (CONFIDENTIAL - ON-PREMISE PROCESSED)
================================================================================
Ref No: MRPL/TS/INSP/DHDT/2026/44-E-102B/089                Date: 31-Aug-2026

SUB: Proposal for Emergency Procurement & In-Situ Retubing of Reactor Effluent
     Air Cooler (REAC) Bay 44-E-102B (DHDT Unit) under DoFP Clause 7.4.2.

1. BACKGROUND & PROBLEM CONTEXT:
   During the pre-turnaround Ultrasonic Thickness Gauging (UTG) inspection of Unit 44,
   severe localized pitting was observed in REAC 44-E-102B (Row 4, Tube 38).

2. TECHNICAL EVALUATION & API 579 FITNESS-FOR-SERVICE:
   a) Nominal Design Wall Thickness (t_nom)      : 3.20 mm
   b) Minimum Observed Thickness (t_act)         : 1.62 mm
   c) Calculated Minimum Retirement Limit (t_min): 1.34 mm (API 579 Level 1)
   d) Active Measured Corrosion Rate             : 0.38 mm/year
   e) Calculated Remaining Service Life          : 0.74 Years (~8.8 Months)
   
   CONCLUSION: Remaining life (8.8 months) is less than the scheduled turnaround 
   cycle (24 months). Retubing is required to prevent hydrogen leakage hazards.

3. FINANCIAL IMPLICATION:
   -----------------------------------------------------------------------------
   Sl.  Description                              Qty     Rate (₹)    Amount (₹)
   -----------------------------------------------------------------------------
   01.  Duplex SS 2205 Finned Tubes (Indigenous) 120 Nos. 24,500   29,40,000/-
   02.  Specialized NDT & Hydraulic Pullout      Lump-sum          6,80,000/-
   03.  Orbital TIG Welding & Hydrotest Services Lump-sum          3,50,000/-
   04.  Contingency (7%)                                            2,80,000/-
   -----------------------------------------------------------------------------
   TOTAL ESTIMATED EXPENDITURE                                      ₹ 42,50,000/-
   (Rupees Forty Two Lakhs Fifty Thousand Only)

4. SANCTION AUTHORITY:
   Per MRPL Delegation of Financial Powers (DoFP) 2024 Schedule II Clause 7.4.2, 
   GM (Technical Services) is empowered to sanction maintenance replacements up to ₹50.00 Lakhs.

5. PRAYER:
   Approval is requested to sanction ₹42.50 Lakhs and float an emergency tender.

   [Initiated: Chief Manager (Inspection)]
   [Concurrence: Senior Manager (Finance)]
   [Sanctioned: General Manager (Technical Services)]
================================================================================`,
        meta: {
          department: 'Technical Services & Inspection Dept',
          refNo: 'MRPL/TS/INSP/DHDT/2026/44-E-102B/089',
          securityClassification: 'RESTRICTED - ON-PREMISE ONLY',
          authorModel: 'Qwen2.5-32B (Local vLLM)',
          airgapVerified: true
        }
      }
    ]
  },
  {
    id: 'pid_vision_analysis',
    title: 'P&ID Safety & Tag Map',
    category: 'Computer Vision',
    taskType: 'pid_vision',
    description: 'Parse P&ID schematic of Crude Distillation Unit overhead reflux loop, identify instrument tags (FT, PT, PRV, LCV), and audit bypass safety interlocks.',
    suggestedPrompt: 'Audit the attached P&ID drawing for CDU-II Overhead System. Extract all instrument tags, verify relief valve redundancy, and flag any HazOp deviations.',
    inputFiles: [
      {
        name: 'MRPL_CDU2_PID_0104_Overhead_Rev3.png',
        type: 'Schematic Image',
        size: '5.8 MB',
        description: 'P&ID diagram with piping lines, control valves, transmitter tags, and relief valves.'
      }
    ],
    expectedModel: 'qwen-2.5-vl-7b',
    routerReason: 'P&ID diagram requiring optical symbol recognition and process safety logic -> Routed to Qwen2.5-VL-7B.',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'thought',
        title: 'Initialize Vision Model',
        content: 'Loading drawing into local Qwen2.5-VL-7B vision engine with zero network access.',
        status: 'completed',
        durationMs: 310,
        timestamp: '10:59:12'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'action',
        title: 'Extract Tags & Bounding Coordinates',
        content: 'Extracting bounding coordinates for instrument bubbles, valves, and relief tags.',
        tool: 'vision_pid_tag_detector',
        toolInput: { image: 'MRPL_CDU2_PID_0104_Overhead_Rev3.png', confidenceThreshold: 0.88 },
        toolOutput: 'IDENTIFIED 14 TAGGED NODES:\n1. [PT-204] Pressure Transmitter (0-10 bar g)\n2. [FT-201] Vortex Flow Transmitter (Reflux Line)\n3. [PRV-102A] Safety Relief Valve (Set: 6.5 bar g)\n4. [PRV-102B] Staggered Relief Valve (Set: 6.8 bar g)\n5. [LCV-104] Level Control Valve (Fail Closed FC)\n6. [BYPASS-V104] 2" Manual Bypass Valve',
        status: 'completed',
        durationMs: 1680,
        timestamp: '10:59:14'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'action',
        title: 'Audit Process Safety & Interlocks',
        content: 'Cross-referencing schematic against OISD-STD-118 Section 7 relief interlock guidelines.',
        tool: 'local_hazop_auditor',
        toolInput: { tags: ['PRV-102A', 'PRV-102B', 'BYPASS-V104', 'LCV-104'], ruleSet: 'OISD-118-REFINERY-SAFETY' },
        toolOutput: 'HAZOP AUDIT FINDINGS:\n[CRITICAL] PRV-102A & PRV-102B isolation valves lack mechanical "Car Seal Open" (CSO) interlock.\n[WARNING] Bypass on LCV-104 is marked "Normally Closed" (NC) instead of "Locked Closed" (LC).\n[OK] Fail action for LCV-104 is verified as FC (Fail-Closed).',
        status: 'completed',
        durationMs: 780,
        timestamp: '10:59:16'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        type: 'deliverable',
        title: 'Generate Safety Compliance Punchlist',
        content: 'Generated engineering safety audit report with tagged bounding boxes and corrective actions.',
        status: 'verified',
        durationMs: 950,
        timestamp: '10:59:17'
      }
    ],
    visionAnnotations: [
      {
        tag: 'PRV-102A/B',
        type: 'hazard',
        x: 70,
        y: 12,
        w: 20,
        h: 24,
        description: 'Dual Safety Relief Valves lack Car Seal Open (CSO) interlock on upstream gate valves.',
        severity: 'CRITICAL'
      },
      {
        tag: 'LCV-104 & Bypass',
        type: 'valve',
        x: 58,
        y: 72,
        w: 18,
        h: 22,
        description: 'Level Control Valve (FC) verified; Manual bypass requires Locked Closed (LC) tag.',
        severity: 'WARNING'
      },
      {
        tag: 'FT-201 & TI-208',
        type: 'instrument',
        x: 44,
        y: 74,
        w: 14,
        h: 18,
        description: 'Overhead reflux flow and temperature transmitters verified on DCS.',
        severity: 'NOMINAL'
      },
      {
        tag: 'Vessel V-102',
        type: 'defect',
        x: 26,
        y: 26,
        w: 24,
        h: 36,
        description: 'Overhead Reflux Accumulator Vessel (Design: 6.5 bar g @ 120°C).',
        severity: 'NOMINAL'
      }
    ],
    deliverables: [
      {
        id: 'deliv-2',
        title: 'Safety Audit Punchlist',
        type: 'report',
        fileName: 'MRPL_CDU2_PID_0104_HazOp_Audit.pdf',
        summary: 'Safety audit punchlist flagging missing CSO interlocks on relief valves and bypass valve recommendations.',
        content: `================================================================================
MRPL PROCESS SAFETY & HAZOP COMPLIANCE REPORT
Drawing: MRPL-CDU2-PID-0104-Rev3 (Overhead Reflux Loop)
================================================================================

1. EXECUTIVE SUMMARY:
   Automated vision inspection conducted on Drawing MRPL-CDU2-PID-0104-Rev3.
   14 field instrument nodes mapped; 1 critical deviation and 1 warning flagged.

2. DETAILED FINDINGS:
   FINDING #01 [CRITICAL - OISD-STD-118 CLAUSE 7.1.4]:
   - Location: Overhead Accumulator Drum V-102 Relief System
   - Equipment: PRV-102A & PRV-102B (Set: 6.5 bar g)
   - Discrepancy: Upstream 3" isolation valves lack "Car Seal Open" (CSO) indication.
   - Recommended Action: Retro-fit mechanical Castell 2-key interlock system.

   FINDING #02 [OPERATIONAL WARNING - MRPL SOP-OPS-012]:
   - Location: Hydrocarbon Condensate Return Line (LCV-104)
   - Discrepancy: Bypass valve marked as "NC" instead of "LC" (Locked Closed).
   - Recommended Action: Update drawing legend and apply DCS lock tag.

3. VERIFIED COMPLIANT NODES:
   - FT-201: Orifice flow transmitter calibrated 0-150 m3/hr.
   - PT-204: SIL-2 pressure transmitter directly linked to ESD matrix.
   - LCV-104: Fail-Closed pneumatic diaphragm actuator verified.
================================================================================`,
        meta: {
          department: 'Health, Safety & Environment (HSE)',
          refNo: 'MRPL/HSE/HAZOP/2026/0104',
          securityClassification: 'CONFIDENTIAL',
          authorModel: 'Qwen2.5-VL-7B (On-Premise)',
          airgapVerified: true
        }
      }
    ]
  },
  {
    id: 'code_sandbox_refinery',
    title: 'Diesel Blending Optimizer',
    category: 'Numerical Optimization',
    taskType: 'code_sandbox',
    description: 'Execute Python optimization inside local sandbox to calculate stream blending ratios for BS-VI Diesel meeting Flash Point (>=35°C), Sulfur (<=10 ppm), and Cetane (>=51).',
    suggestedPrompt: 'Optimize 3-stream blending (Heavy Naphtha, LGO, HGO) to produce 10,000 bpd BS-VI Diesel with Flash Point >= 35°C, Sulfur <= 10 ppm, and Cetane >= 51. Run in sandbox and output recipe.',
    inputFiles: [
      {
        name: 'MRPL_Crude_Streams_Assay_2026.csv',
        type: 'CSV File',
        size: '18 KB',
        description: 'Stream properties: Heavy Naphtha, LGO, HGO with sulfur content and distillation values.'
      }
    ],
    expectedModel: 'qwen-2.5-coder-32b',
    routerReason: 'Scientific optimization & nonlinear constraints -> Routed to Qwen2.5-Coder-32B + local nsjail airgap sandbox.',
    codeSnippet: `import numpy as np
from scipy.optimize import minimize

streams = {
    'Heavy_Naphtha': {'S': 2.5, 'FP': -5.0, 'CI': 32.0, 'cost': 68.5},
    'LGO':           {'S': 8.2, 'FP': 48.0, 'CI': 54.5, 'cost': 79.2},
    'HGO':           {'S': 14.5, 'FP': 82.0, 'CI': 56.0, 'cost': 84.0}
}
TARGET_VOL = 10000.0

def flash_index(fp):
    return 10 ** (-0.06 * fp + 4.2)

def inv_flash_index(idx):
    return (4.2 - np.log10(idx)) / 0.06

def objective(x):
    cost = sum(x[i] * streams[name]['cost'] for i, name in enumerate(streams))
    revenue = TARGET_VOL * 94.0
    return -(revenue - cost)

def constraint_vol(x):
    return np.sum(x) - TARGET_VOL

def constraint_sulfur(x):
    avg_s = sum(x[i] * streams[name]['S'] for i, name in enumerate(streams)) / TARGET_VOL
    return 10.0 - avg_s

def constraint_flash_point(x):
    v_fracs = x / TARGET_VOL
    blend_idx = sum(v_fracs[i] * flash_index(streams[name]['FP']) for i, name in enumerate(streams))
    return inv_flash_index(blend_idx) - 35.0

def constraint_cetane(x):
    avg_ci = sum(x[i] * streams[name]['CI'] for i, name in enumerate(streams)) / TARGET_VOL
    return avg_ci - 51.0

x0 = [1000.0, 6000.0, 3000.0]
bounds = [(0, TARGET_VOL), (0, TARGET_VOL), (0, TARGET_VOL)]
cons = [
    {'type': 'eq', 'fun': constraint_vol},
    {'type': 'ineq', 'fun': constraint_sulfur},
    {'type': 'ineq', 'fun': constraint_flash_point},
    {'type': 'ineq', 'fun': constraint_cetane}
]

res = minimize(objective, x0, method='SLSQP', bounds=bounds, constraints=cons)
if res.success:
    x_opt = res.x
    print("Optimization Solved Successfully")
    print(f"Heavy Naphtha : {x_opt[0]:.1f} bbl/day ({x_opt[0]/100:.1f}%)")
    print(f"LGO (Light)   : {x_opt[1]:.1f} bbl/day ({x_opt[1]/100:.1f}%)")
    print(f"HGO (Heavy)   : {x_opt[2]:.1f} bbl/day ({x_opt[2]/100:.1f}%)")`,
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'thought',
        title: 'Formulate Blending Equations',
        content: 'Setting up 3-component stream blending equations with flash point non-linearity.',
        status: 'completed',
        durationMs: 280,
        timestamp: '11:00:01'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'action',
        title: 'Synthesize Python Script',
        content: 'Generating Python script with scipy SLSQP solver and boundary constraints.',
        tool: 'code_generator_qwen_coder',
        toolInput: { language: 'python3', solver: 'SLSQP', constraints: ['Volume', 'Sulfur <= 10ppm', 'Flash Point >= 35C', 'Cetane >= 51'] },
        toolOutput: 'Generated 65 lines of Python script with zero external web dependencies.',
        status: 'completed',
        durationMs: 1100,
        timestamp: '11:00:03'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'action',
        title: 'Run Sandbox Execution',
        content: 'Running code in isolated nsjail environment with zero outbound sockets.',
        tool: 'nsjail_python_executor',
        toolInput: { memoryLimit: '256MB', cpuLimit: '2.0s', network: 'none' },
        toolOutput: `MRPL BS-VI DIESEL BLEND OPTIMIZATION RESULTS [SOLVED]
=======================================================
Heavy Naphtha :    640.2 bbl/day (6.4%)
LGO (Light)   :   6812.5 bbl/day (68.1%)
HGO (Heavy)   :   2547.3 bbl/day (25.5%)
-------------------------------------------------------
Total Batch   :  10000.0 bbl/day
Final Sulfur  :     9.44 ppmw (Limit: <= 10.0 ppmw) [PASS]
Flash Point   :    35.80 °C   (Limit: >= 35.0 °C)   [PASS]
Cetane Index  :    53.48      (Limit: >= 51.0)      [PASS]
-------------------------------------------------------
Daily Net Margin: $ 143,260.40 USD (~ ₹ 124.92 Lakhs/day)
=======================================================
Sandbox exit code: 0 (Normal). 0 network sockets requested.`,
        status: 'completed',
        durationMs: 420,
        timestamp: '11:00:04'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        type: 'deliverable',
        title: 'Export Blending Recipe',
        content: 'Generated standalone Python solver script and production recipe.',
        status: 'verified',
        durationMs: 350,
        timestamp: '11:00:05'
      }
    ],
    deliverables: [
      {
        id: 'deliv-3',
        title: 'Diesel Blend Optimizer Script (.py)',
        type: 'py',
        fileName: 'mrpl_bs6_diesel_optimizer.py',
        summary: 'Validated Python script with scipy SLSQP solver and Chevron-Maxwell flash point indexing.',
        content: `# MRPL Sovereign AI Workbench - Process Optimization Module
# Target: BS-VI Diesel (IS 1460:2020) Blending Optimization

import numpy as np
from scipy.optimize import minimize

streams = {
    'Heavy_Naphtha': {'S': 2.5, 'FP': -5.0, 'CI': 32.0, 'cost': 68.5},
    'LGO':           {'S': 8.2, 'FP': 48.0, 'CI': 54.5, 'cost': 79.2},
    'HGO':           {'S': 14.5, 'FP': 82.0, 'CI': 56.0, 'cost': 84.0}
}
TARGET_VOL = 10000.0

def flash_index(fp):
    return 10 ** (-0.06 * fp + 4.2)

def inv_flash_index(idx):
    return (4.2 - np.log10(idx)) / 0.06

def objective(x):
    cost = sum(x[i] * streams[name]['cost'] for i, name in enumerate(streams))
    revenue = TARGET_VOL * 94.0
    return -(revenue - cost)

def constraint_vol(x):
    return np.sum(x) - TARGET_VOL

def constraint_sulfur(x):
    avg_s = sum(x[i] * streams[name]['S'] for i, name in enumerate(streams)) / TARGET_VOL
    return 10.0 - avg_s

def constraint_flash_point(x):
    v_fracs = x / TARGET_VOL
    blend_idx = sum(v_fracs[i] * flash_index(streams[name]['FP']) for i, name in enumerate(streams))
    return inv_flash_index(blend_idx) - 35.0

def constraint_cetane(x):
    avg_ci = sum(x[i] * streams[name]['CI'] for i, name in enumerate(streams)) / TARGET_VOL
    return avg_ci - 51.0

x0 = [1000.0, 6000.0, 3000.0]
bounds = [(0, TARGET_VOL), (0, TARGET_VOL), (0, TARGET_VOL)]
cons = [
    {'type': 'eq', 'fun': constraint_vol},
    {'type': 'ineq', 'fun': constraint_sulfur},
    {'type': 'ineq', 'fun': constraint_flash_point},
    {'type': 'ineq', 'fun': constraint_cetane}
]

res = minimize(objective, x0, method='SLSQP', bounds=bounds, constraints=cons)
print("Optimization Status:", res.message)
print("Optimal Recipe (bbl/day):", res.x)
`,
        meta: {
          department: 'Refinery Process Planning & Scheduling',
          refNo: 'CODE-OPT-2026-044',
          securityClassification: 'PROPRIETARY REFINERY ALGORITHM',
          authorModel: 'Qwen2.5-Coder-32B (On-Premise)',
          airgapVerified: true
        }
      }
    ]
  },
  {
    id: 'confidential_financial_spreadsheet',
    title: 'Commercial Bid Evaluation',
    category: 'Procurement',
    taskType: 'financial_spreadsheet',
    description: 'Process commercial tenders for 45 MT catalyst replacement across 3 bidders, calculate landed cost with customs duty and GST, and determine L1 bidder.',
    suggestedPrompt: 'Evaluate commercial price bids for 45 MT catalyst tender across Bidders A, B, and C. Calculate freight, customs duty (7.5%), IGST (18%), and determine L1 bidder.',
    inputFiles: [
      {
        name: 'Confidential_Price_Bids_Tender_012.pdf',
        type: 'Commercial PDF',
        size: '1.2 MB',
        description: 'Price bids opened by MRPL Tender Committee.'
      }
    ],
    expectedModel: 'qwen-2.5-32b',
    routerReason: 'Confidential commercial math + procurement rules -> Routed to Qwen2.5-32B + Python spreadsheet builder.',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'thought',
        title: 'Parse Commercial Terms',
        content: 'Analyzing vendor quotes under local isolation. Exchange rate fixed at ₹87.20/USD.',
        status: 'completed',
        durationMs: 310,
        timestamp: '11:01:20'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'action',
        title: 'Calculate Landed Cost & Rank',
        content: 'Executing local Python script to compute landed costs and ranking logic.',
        tool: 'python_spreadsheet_builder',
        toolInput: { tenderId: 'MRPL/MAT/CAT/2026/012', quantityMT: 45.0, bidders: ['Vendor Alpha (USA)', 'Vendor Beta (Denmark)', 'Vendor Gamma (India)'] },
        toolOutput: 'COMPUTED EVALUATED LANDED COST:\n- Vendor Beta (Denmark): Total Landed ₹ 11,84,66,240/- [Rank: L1 - LOWEST]\n- Vendor Alpha (USA): Total Landed ₹ 12,62,09,660/- [Rank: L2]\n- Vendor Gamma (India): Total Landed ₹ 13,54,05,000/- [Rank: L3]',
        status: 'completed',
        durationMs: 820,
        timestamp: '11:01:22'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'deliverable',
        title: 'Export Comparative Statement',
        content: 'Generated official Comparative Statement spreadsheet with cell formulas.',
        status: 'verified',
        durationMs: 400,
        timestamp: '11:01:23'
      }
    ],
    deliverables: [
      {
        id: 'deliv-4',
        title: 'Comparative Statement (.xlsx / CSV)',
        type: 'xlsx',
        fileName: 'MRPL_TENDER_012_CATALYST_CS.csv',
        summary: 'Financial comparative statement with customs duties, taxes, and L1 determination.',
        content: `MANGALORE REFINERY AND PETROCHEMICALS LIMITED
COMMERCIAL EVALUATION COMPARATIVE STATEMENT (CS)
Tender No: MRPL/MAT/CAT/2026/012 | Item: 45 MT Catalyst | Exchange Rate: 1 USD = 87.20 INR

Bidder Name,Origin,Currency,Unit FOB/Ex-Works,Total Base Price (USD),Freight & Ins (USD),CIF Mangalore (INR),Customs Duty (7.5%),IGST / GST (18%),Total Landed Cost (INR),Rank
Vendor Beta (Denmark),Foreign,USD,22800.00,1026000.00,45000.00,"9,33,91,200.00","70,04,340.00","1,80,70,700.00","11,84,66,240.00",L1 (RECOMMENDED)
Vendor Alpha (USA),Foreign,USD,24200.00,1089000.00,52000.00,"9,94,95,200.00","74,62,140.00","1,92,52,320.00","12,62,09,660.00",L2
Vendor Gamma (India),Domestic,INR,2550000.00,N/A,N/A,"11,47,50,000.00",0.00,"2,06,55,000.00","13,54,05,000.00",L3

Tender Committee Observation:
1. Vendor Beta is the lowest technically acceptable and commercially evaluated L1 bidder.
2. Estimated savings compared to engineering budget (₹12.80 Crores): ₹95.33 Lakhs (7.45%).
3. Recommended for award of Purchase Order to Vendor Beta subject to approval.`,
        meta: {
          department: 'Materials & Procurement Dept',
          refNo: 'MRPL/MAT/CAT/2026/012',
          securityClassification: 'STRICTLY CONFIDENTIAL - COMMERCIAL ENVELOPE',
          authorModel: 'Qwen2.5-32B (On-Premise)',
          airgapVerified: true
        }
      }
    ]
  },
  {
    id: 'sovereign_rag_sop',
    title: 'Refinery Safety SOP Search',
    category: 'Knowledge Retrieval',
    taskType: 'sovereign_rag',
    description: 'Ground AI agent in local vector database (BGE-M3 embeddings) indexing MRPL SOPs and OISD-STD-118 safety rules with zero cloud transit.',
    suggestedPrompt: 'What are the statutory safety prerequisites and gas testing frequency required for a Hot Work Permit in Zone 1 according to OISD-STD-118 and MRPL Safety SOP-088?',
    inputFiles: [
      {
        name: 'OISD-STD-118_Relief_and_Safety.pdf',
        type: 'Statutory Standard',
        size: '4.8 MB',
        description: 'Ministry of Petroleum & Natural Gas OISD safety standard.'
      },
      {
        name: 'MRPL_HSE_SOP_088_Work_Permit_System.pdf',
        type: 'Internal SOP',
        size: '2.1 MB',
        description: 'MRPL refinery safety standard operating procedures.'
      }
    ],
    expectedModel: 'qwen-2.5-32b',
    routerReason: 'Local semantic vector query (BGE-M3) + Grounded statutory synthesis -> Routed to Qwen2.5-32B.',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'thought',
        title: 'Run Vector Search',
        content: 'Executing BGE-M3 embedding search across local vector collection "mrpl_statutory_safety".',
        status: 'completed',
        durationMs: 140,
        timestamp: '11:02:10'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'action',
        title: 'Retrieve Safety Chunks',
        content: 'Retrieving top 4 chunks with cosine similarity >= 0.84.',
        tool: 'local_vector_retriever',
        toolInput: { collection: 'mrpl_statutory_safety', top_k: 4, query: 'Hot work permit Zone 1 gas test frequency' },
        toolOutput: 'RETRIEVED 4 GROUNDED CHUNKS:\n1. [OISD-STD-118 Clause 5.3.1]: Combustible gas monitoring (LEL < 1%) and oxygen (19.5%-23.5%) mandatory throughout hot work.\n2. [MRPL SOP-088 Sec 4.2]: Gas testing must be conducted within 30 minutes of job start. Re-test mandatory if paused >1 hr.\n3. [MRPL SOP-088 Sec 4.6]: Minimum 1 pressurized 2.5-inch fire hose with dedicated fire watcher within 15m radius.',
        status: 'completed',
        durationMs: 290,
        timestamp: '11:02:11'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'deliverable',
        title: 'Generate Safety Checklist',
        content: 'Generated actionable, clause-referenced compliance guide.',
        status: 'verified',
        durationMs: 620,
        timestamp: '11:02:12'
      }
    ],
    deliverables: [
      {
        id: 'deliv-5',
        title: 'Safety Compliance Checklist',
        type: 'report',
        fileName: 'MRPL_HOT_WORK_ZONE1_CHECKLIST.txt',
        summary: 'Safety compliance checklist with direct citations to OISD-STD-118 and MRPL SOP-088.',
        content: `================================================================================
MRPL HEALTH, SAFETY & ENVIRONMENT (HSE) COMPLIANCE BRIEF
Topic: Statutory Prerequisites for Hot Work in Zone-1 Battery Limits
Citations: OISD-STD-118 & MRPL SOP-HSE-088 (Local Vector DB)
================================================================================

1. MANDATORY ATMOSPHERIC GAS TESTING:
   [ ] Combustible Gas: MUST be 0.0% LEL (Max allowable: < 1.0% LEL).
   [ ] Oxygen Content: MUST be between 19.5% and 23.5% by volume.
   [ ] Toxic Gases: H2S must be 0.0 ppm (Ceiling: 5.0 ppm).
   [ ] Timing: Gas test within 30 minutes before starting work.
   [ ] Frequency: Re-test every 2 hours or after work stoppage > 60 minutes.

2. AREA ISOLATION:
   [ ] Radius Clearance: 15-meter radius cleared of combustibles.
   [ ] Drains & Sumps: Covered with fire-retardant blankets and sandbags.

3. FIRE SAFETY READINESS:
   [ ] Pressurized Fire Hose: Minimum one 2.5" hose charged to >= 7.0 kg/cm2.
   [ ] Portable Extinguishers: Minimum two 10 kg DCP extinguishers on site.
   [ ] Fire Watcher: Dedicated trained fire watcher on site.

4. PERMIT SIGN-OFF:
   - Initiator: Maintenance Executive
   - Gas Tester: Certified Fire Officer
   - Approving Authority: GM (Operations)
================================================================================`,
        meta: {
          department: 'Fire & Safety Directorate',
          refNo: 'SOP-CHECKLIST-HSE-2026',
          securityClassification: 'INTERNAL SOP',
          authorModel: 'Qwen2.5-32B + BGE-M3',
          airgapVerified: true
        }
      }
    ]
  }
];
