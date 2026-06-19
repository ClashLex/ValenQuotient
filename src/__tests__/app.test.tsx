import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../App';
import AboutSection from '../components/AboutSection';
import CTASection from '../components/CTASection';
import { Sidebar } from '../components/Sidebar';
import AdvisoryModal from '../components/AdvisoryModal';
import CollectionSection from '../components/CollectionSection';
import { DEFAULT_CATEGORIES } from '../constants/emissions';

// Mock Firebase modules so tests don't fail without credentials
vi.mock('../firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    getAuth: vi.fn(() => ({})),
    onAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return vi.fn(); }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    GoogleAuthProvider: vi.fn(() => ({ setCustomParameters: vi.fn() })),
  };
});

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
    setDoc: vi.fn(() => Promise.resolve()),
    updateDoc: vi.fn(() => Promise.resolve()),
    serverTimestamp: vi.fn(() => new Date()),
  };
});

describe('App & Remaining Components Coverage', () => {
  it('renders App correctly and shows Hero by default', async () => {
    // Need to mock matchMedia if used, but it seems not.
    // Suspense might need await act
    await act(async () => {
      render(<App />);
    });
    expect(screen.getAllByText(/VALENQUOTIENT/i).length).toBeGreaterThan(0);
  });

  describe('CollectionSection Integrations', () => {
    it('opens add form and creates a new tracker', () => {
      const mockSelectNFT = vi.fn();
      const mockUpdateTracker = vi.fn();
      const mockAddCategory = vi.fn();
      const mockDeleteCategory = vi.fn();

      render(
        <CollectionSection
          categories={DEFAULT_CATEGORIES}
          trackerValues={{}}
          onUpdateTrackerValue={mockUpdateTracker}
          onAddCategory={mockAddCategory}
          onDeleteCategory={mockDeleteCategory}
          onSelectNFT={mockSelectNFT}
        />
      );

      // Open add form
      fireEvent.click(screen.getByText(/CUSTOM TRACKER/i));
      expect(screen.getByText(/Tracker Title/i)).toBeInTheDocument();

      // Submit form
      const titleInput = screen.getByLabelText(/Tracker Title/i);
      const unitInput = screen.getByLabelText(/Unit Label/i);
      const submitBtn = screen.getByText(/Create Tracker/i);
      
      fireEvent.change(titleInput, { target: { value: 'New Footprint' } });
      fireEvent.change(unitInput, { target: { value: 'LBS' } });
      
      // diet mode
      const dietBtn = screen.getByRole('button', { name: /Diet/i });
      fireEvent.click(dietBtn);

      fireEvent.click(submitBtn);

      expect(mockAddCategory).toHaveBeenCalled();
    });
  });

  describe('AboutSection', () => {
    it('renders and switches tabs', () => {
      const setActiveSection = vi.fn();
      render(<AboutSection setActiveSection={setActiveSection} />);
      expect(screen.getByText(/WHY VALENQUOTIENT/i)).toBeInTheDocument();
      
      const causesTab = screen.getByText('Causes');
      fireEvent.click(causesTab);
      expect(screen.getByText(/AWARENESS DEFICIT/i)).toBeInTheDocument();

      const solutionTab = screen.getByText('Solution');
      fireEvent.click(solutionTab);
      expect(screen.getByText(/VALENQUOTIENT LOGICAL CORE ENGINE/i)).toBeInTheDocument();

      const calculateBtn = screen.getByText(/CALCULATE Baseline Footprint/i);
      fireEvent.click(calculateBtn);
      expect(setActiveSection).toHaveBeenCalledWith('trackers');
    });
  });

  describe('CTASection', () => {
    it('renders and allows clicking FAQ accordion', () => {
      render(<CTASection />);
      expect(screen.getByText(/JOIN VALENQUOTIENT/i)).toBeInTheDocument();
      const faqBtn = screen.getByText(/IS MY DATA PRIVATE/i);
      fireEvent.click(faqBtn);
      expect(screen.getByText(/ALL CALCULATIONS HAPPEN LOCALLY/i)).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('renders correctly and allows changing active section', () => {
      const setActiveSection = vi.fn();
      const onOpenAuth = vi.fn();
      render(<Sidebar activeSection="home" setActiveSection={setActiveSection} onOpenAuth={onOpenAuth} />);
      const btn = screen.getByLabelText('Gap Matrix');
      fireEvent.click(btn);
      expect(setActiveSection).toHaveBeenCalledWith('analysis');
    });
  });

  describe('AdvisoryModal', () => {
    it('renders correctly with categoryItem and closes on escape', () => {
      const onClose = vi.fn();
      const mockCategory = DEFAULT_CATEGORIES[0];
      
      const { container } = render(
        <AdvisoryModal categoryItem={mockCategory} onClose={onClose} selectedValue={20} />
      );
      
      expect(screen.getByText(/AI FOOTPRINT DIAGNOSTIC/i)).toBeInTheDocument();
      
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });
      // Event listener is attached to document
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('returns null if no categoryItem', () => {
      const { container } = render(
        <AdvisoryModal categoryItem={null} onClose={vi.fn()} selectedValue={null} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders without crashing with categoryItem', () => {
      const onClose = vi.fn();
      const mockCategory = DEFAULT_CATEGORIES[0]; // Transport
      render(
        <AdvisoryModal categoryItem={mockCategory} onClose={onClose} selectedValue={20} />
      );
      
      expect(screen.getByText(/AI FOOTPRINT DIAGNOSTIC/i)).toBeInTheDocument();
    });
  });
});
