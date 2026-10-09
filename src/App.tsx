/**
 * JATAYU Autonomous Disaster Command Center
 * Hackathon: VISTERA 2026 | Team: IGNITE
 * Tagline: "See the Disaster. Prioritize the Risk. Save Lives."
 */

import React, { useState, useEffect } from 'react';
import { DisasterEvent, DamagedBuilding, MissionStep } from './types';
import { DEMO_EVENTS } from './data/demoEvents';
import { Navbar } from './components/Navbar';
import { MissionControlTab } from './components/MissionControlTab';
import { FindingsTab } from './components/FindingsTab';
import { SimulationsTab } from './components/SimulationsTab';
import { DataSourcesTab } from './components/DataSourcesTab';
import { AlertsTab } from './components/AlertsTab';
import { MissionReportModal } from './components/MissionReportModal';
import { Radio, ShieldAlert } from 'lucide-react';

const INITIAL_MISSION_LOGS: MissionStep[] = [
  {
    step: 'TASKED',
    timestamp: '11:47:02',
    source: 'MISSION_SCHEDULER',
    acquisition_time: '2026-07-21 03:40 UTC',
    status: 'DONE',
    detail: 'Virtual Drone assigned to AOI corridor. Initial bounding box locked (14.2 km x 9.8 km).',
  },
  {
    step: 'DISCOVERING',
    timestamp: '11:47:04',
    source: 'FEDERATED_STAC_DISCOVERY',
    acquisition_time: '2026-07-21 04:10 UTC',
    status: 'DONE',
    detail: 'Catalog search complete: Sentinel-1 C-SAR (10m) + NISAR L-SAR (6m) + Vantor 30cm optical available.',
  },
  {
    step: 'ACQUIRING',
    timestamp: '11:47:06',
    source: 'ASF_CDSE_INGESTION',
    acquisition_time: '2026-07-21 04:12 UTC',
    status: 'DONE',
    detail: 'Downloaded Sentinel-1 IW GRD (VV/VH) & NISAR L-band pre/post pairs. Verified checksums.',
  },
  {
    step: 'PREPROCESSING',
    timestamp: '11:47:08',
    source: 'SAR_CALIBRATION_PIPELINE',
    acquisition_time: '2026-07-21 04:15 UTC',
    status: 'DONE',
    detail: 'Radiometric calibration to sigma0 (dB). 5x5 Lee speckle suppression applied.',
  },
  {
    step: 'FLOOD_ANALYSIS',
    timestamp: '11:47:10',
    source: 'SAR_CHANGE_DETECTOR',
    acquisition_time: '2026-07-21 04:18 UTC',
    status: 'DONE',
    detail: 'Detected water backscatter drop (<-16 dB, drop >= 4.5 dB). Copernicus GFM cross-check: 94.2% agreement.',
  },
  {
    step: 'EXPOSURE',
    timestamp: '11:47:12',
    source: 'WORLDPOP_OSM_PIPELINE',
    acquisition_time: '2026-07-21 04:20 UTC',
    status: 'DONE',
    detail: 'Tier 1 exposure calculated: 14,250 population exposed, 2 hospitals & 3 bridges inside flood polygon.',
  },
  {
    step: 'BUILDING_INSPECTION',
    timestamp: '11:47:14',
    source: 'YOLO_XBD_INSPECTOR',
    acquisition_time: '2026-07-21 04:22 UTC',
    status: 'DONE',
    detail: 'Tier 2 VHR optical scene inspected: 1,140 building footprints classified into 4 xBD damage categories.',
  },
  {
    step: 'SCORING',
    timestamp: '11:47:16',
    source: 'SCORING_ENGINE',
    acquisition_time: '2026-07-21 04:25 UTC',
    status: 'DONE',
    detail: 'Computed severity score 88.4/100 (30% extent, 30% pop, 20% infra, 20% access + Tier 2). Assigned P1.',
  },
  {
    step: 'ALERTING',
    timestamp: '11:47:18',
    source: 'EMERGENCY_DISPATCH',
    acquisition_time: '2026-07-21 04:26 UTC',
    status: 'DONE',
    detail: 'Automated location-based alert queued and transmitted to NDRF and district command.',
  },
  {
    step: 'COMPLETE',
    timestamp: '11:47:20',
    source: 'MISSION_CONTROLLER',
    acquisition_time: '2026-07-21 04:28 UTC',
    status: 'DONE',
    detail: 'Virtual Drone mission finished. Situational intelligence available in dashboard.',
  },
];

export default function App() {
  const [currentEvent, setCurrentEvent] = useState<DisasterEvent>(DEMO_EVENTS[0]);
  const [activeTab, setActiveTab] = useState<string>('mission_control');

  // Virtual Drone Mission Execution State
  const [isMissionRunning, setIsMissionRunning] = useState<boolean>(false);
  const [missionLogs, setMissionLogs] = useState<MissionStep[]>(INITIAL_MISSION_LOGS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(9);

  // Monitor mode (periodically polls for new overpasses)
  const [monitorMode, setMonitorMode] = useState<boolean>(true);
  const [newAcquisitionAlert, setNewAcquisitionAlert] = useState<boolean>(false);

  // Modals
  const [selectedBuildingForModal, setSelectedBuildingForModal] = useState<DamagedBuilding | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Monitor mode simulation timer
  useEffect(() => {
    if (!monitorMode) return;
    const interval = setInterval(() => {
      setNewAcquisitionAlert((prev) => !prev);
    }, 45000);
    return () => clearInterval(interval);
  }, [monitorMode]);

  // Execute Virtual Drone Mission progression simulation
  const handleRunMission = () => {
    if (isMissionRunning) return;
    setIsMissionRunning(true);
    setNewAcquisitionAlert(false);
    setCurrentStepIndex(0);

    const stepDefs: { step: MissionStep['step']; source: string; detail: string }[] = [
      { step: 'TASKED', source: 'MISSION_SCHEDULER', detail: `Virtual Drone tasked to ${currentEvent.location_name}. AOI boundaries locked.` },
      { step: 'DISCOVERING', source: 'MULTI_CATALOG_FEDERATION', detail: 'Federated STAC discovery querying ESA CDSE, NASA ASF DAAC, and Maxar AWS catalogs...' },
      { step: 'ACQUIRING', source: 'SATELLITE_DOWNLINK', detail: `Ingesting Sentinel-1 SAR & NISAR L-band. Checking Vantor sub-meter optical coverage (${currentEvent.vantor_coverage ? 'Available' : 'No VHR optical'}).` },
      { step: 'PREPROCESSING', source: 'CALIBRATION_PIPELINE', detail: 'Applying orbit state vectors, terrain correction, and Lee speckle filtering to SAR granules.' },
      { step: 'FLOOD_ANALYSIS', source: 'DUAL_BAND_SAR_DETECTOR', detail: 'Delineating flood surface: C-band backscatter drop + L-band canopy penetration. Cross-referencing Copernicus GFM.' },
      { step: 'EXPOSURE', source: 'WORLDPOP_OVERLAY', detail: 'Calculating exposure against WorldPop 100m grid and OSM transport/hospital networks.' },
      { step: 'BUILDING_INSPECTION', source: 'YOLO_XBD_INSPECTOR', detail: currentEvent.vantor_coverage ? 'Running YOLOv8x damage classification across high-resolution footprints.' : 'VHR optical unavailable. Preserving Tier 1 wide-area exposure mode.' },
      { step: 'SCORING', source: 'SCORING_ENGINE', detail: 'Applying weighted heuristic (30% extent, 30% pop, 20% infra, 20% access). Calculating P1/P2/P3 priorities.' },
      { step: 'ALERTING', source: 'EMERGENCY_DISPATCH', detail: 'Transmitting location-based tactical warnings to Emergency Operations Center (EOC).' },
      { step: 'COMPLETE', source: 'MISSION_CONTROLLER', detail: 'Mission accomplished. Comprehensive disaster intelligence updated.' },
    ];

    const currentLogs: MissionStep[] = [];

    stepDefs.forEach((s, idx) => {
      setTimeout(() => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const newStep: MissionStep = {
          step: s.step,
          timestamp: timeStr,
          source: s.source,
          acquisition_time: `${now.toISOString().substring(0, 10)} 04:15 UTC`,
          status: 'DONE',
          detail: s.detail,
        };

        currentLogs.push(newStep);
        setMissionLogs([...currentLogs]);
        setCurrentStepIndex(idx);

        if (idx === stepDefs.length - 1) {
          setIsMissionRunning(false);
        }
      }, (idx + 1) * 900);
    });
  };

  return (
    <div className="min-h-screen bg-[#070708] text-[#F4F4F5] flex flex-col font-sans selection:bg-[#E10600] selection:text-white">
      {/* 1. Universal Top Navigation Bar */}
      <Navbar
        currentEvent={currentEvent}
        onSelectEvent={(ev) => {
          setCurrentEvent(ev);
        }}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isMissionRunning={isMissionRunning}
        onRunMission={handleRunMission}
        monitorMode={monitorMode}
        onToggleMonitor={() => setMonitorMode(!monitorMode)}
        newAcquisitionAlert={newAcquisitionAlert}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Main Tab Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 pt-4">
        {activeTab === 'mission_control' && (
          <MissionControlTab
            currentEvent={currentEvent}
            onSelectEvent={(ev) => setCurrentEvent(ev)}
            isMissionRunning={isMissionRunning}
            onRunMission={handleRunMission}
            missionLogs={missionLogs}
            currentStepIndex={currentStepIndex}
            onSelectBuilding={(bldg) => setSelectedBuildingForModal(bldg)}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'findings' && (
          <FindingsTab
            currentEvent={currentEvent}
            onSelectBuilding={(bldg) => setSelectedBuildingForModal(bldg)}
            selectedBuildingForModal={selectedBuildingForModal}
            onCloseBuildingModal={() => setSelectedBuildingForModal(null)}
          />
        )}

        {activeTab === 'simulations' && (
          <SimulationsTab
            currentEvent={currentEvent}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'sources' && (
          <DataSourcesTab />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            currentEvent={currentEvent}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}
      </main>

      {/* 3. Printable / Exportable Mission Report Modal */}
      {isReportModalOpen && (
        <MissionReportModal
          currentEvent={currentEvent}
          missionLogs={missionLogs}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* 4. Mandatory Operational Footer on Every Page */}
      <footer className="mt-auto bg-[#0F0F12] border-t border-[#26262E] py-3.5 px-4 lg:px-6 text-center text-xs text-[#A1A1AA] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E10600]" />
          <span className="font-semibold text-white tracking-wide font-display text-[11px]">
            JATAYU DISASTER COMMAND SYSTEM
          </span>
          <span className="text-[#26262E]">|</span>
          <span className="font-mono-code text-[11px]">VISTERA 2026 · TEAM IGNITE</span>
        </div>

        {/* The Exact Mandatory Footer Copy */}
        <p className="text-[11px] text-[#A1A1AA]">
          Latest available imagery, acquisition times shown. Severity is a transparent weighted heuristic. AI damage labels are estimates, verify on the ground.
        </p>

        <div className="text-[11px] font-mono-code text-[#A1A1AA]">
          CORE: <strong className="text-[#00E676]">ONLINE</strong>
        </div>
      </footer>
    </div>
  );
}
