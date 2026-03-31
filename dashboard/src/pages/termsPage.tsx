import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useAdminAcademicTerms } from '../api/terms';
import type { AcademicTermRecord } from '../api/types';
import { formatTimestamp } from '../ultis/format';


const columns: GridColDef<AcademicTermRecord>[] = [
  { field: 'id', headerName: 'Term ID', width: 220, sortable: true },
  { field: 'term_name', headerName: 'Term name', width: 260, sortable: true },
  { field: 'start_date', headerName: 'Start', width: 180, sortable: true },
  { field: 'end_date', headerName: 'End', width: 180, sortable: true },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 220,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.created_at),
  },
];

export const TermsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminAcademicTerms();

  const searchKeys = useMemo(
    () => (row: AcademicTermRecord) => [row.id, row.term_name],
    []
  );

  return (
    <ResourceTableLayout
      title="Academic terms"
      description="Định nghĩa kỳ học và thời gian áp dụng."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by term or id"
      searchKeys={searchKeys}
      emptyMessage="No academic terms registered."
      getRowId={(row) => row.id}
    />
  );
};
