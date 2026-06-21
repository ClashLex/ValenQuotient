import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdvisoryModal from '../components/AdvisoryModal';

describe('AdvisoryModal', () => {
  const mockCategory = {
    id: '1',
    title: 'Test Category',
    name: 'Test Category',
    icon: 'Leaf',
    category: 'Energy' as const,
    description: 'A test description',
    advisory: 'A test advisory',
    impactScore: 'High',
    videoUrl: '',
    unit: 'kg',
    baseRate: 1,
    specs: ['spec 1', 'spec 2'],
    year: '2026'
  };

  it('does not render when categoryItem is null', () => {
    const { container } = render(
      <AdvisoryModal categoryItem={null} selectedValue={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal content when categoryItem is provided', () => {
    render(
      <AdvisoryModal categoryItem={mockCategory} selectedValue={100} onClose={vi.fn()} />
    );
    expect(screen.getByText(/Test Category/i)).toBeInTheDocument();
    expect(screen.getByText(/A test description/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <AdvisoryModal categoryItem={mockCategory} selectedValue={100} onClose={mockOnClose} />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
