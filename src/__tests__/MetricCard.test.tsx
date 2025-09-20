import { render, screen } from '@testing-library/react';
import MetricCard from '../components/dashboard/MetricCard';

describe('MetricCard Component', () => {
  it('renders metric card with title and value', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
      />
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows change indicator when provided', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        change="+5%"
      />
    );

    // Check for change display
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('shows negative change indicator', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        change="-3%"
      />
    );

    // Check for negative change display
    expect(screen.getByText('-3%')).toBeInTheDocument();
  });
});