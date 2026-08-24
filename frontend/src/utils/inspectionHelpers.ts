/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InspectionStepConfig {
  num: string;
  title: string;
  desc: string;
}

export const INSPECTION_STEPS: InspectionStepConfig[] = [
  { num: '01', title: 'CAPTURE', desc: 'Package evidence' },
  { num: '02', title: 'REVIEW', desc: 'Verify clarity' },
  { num: '03', title: 'ANALYZE', desc: 'Declarations extraction' },
  { num: '04', title: 'RESULTS', desc: 'Compliance status' },
];

export const STEP_HEADINGS: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: 'Start a new inspection',
    subtitle: 'Capture clear images of the packaged commodity to begin the compliance review.',
  },
  1: {
    title: 'Verify captured images',
    subtitle: 'Confirm image legibility and orientation before initiating declaration extraction.',
  },
  2: {
    title: 'Review package declarations',
    subtitle: 'Extract visible information from the package images and review the detected declarations before compliance validation.',
  },
  3: {
    title: 'Compliance review readiness',
    subtitle: 'The next stage will compare the reviewed package information against the applicable compliance requirements.',
  },
};
