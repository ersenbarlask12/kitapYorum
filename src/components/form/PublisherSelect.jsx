import { Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import { usePublishers } from '../../hooks/usePublishers';
import { AlertCircle } from 'lucide-react';

export function PublisherSelect({ control, errors, name = 'yayin_evi' }) {
  const { publishers, loading } = usePublishers();

  return (
    <div>
      <label className="form-label" htmlFor={name}>Yayınevi *</label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <CreatableSelect
            isClearable
            isDisabled={loading}
            isLoading={loading}
            onChange={(selected) => onChange(selected ? selected.value : '')}
            onBlur={onBlur}
            value={publishers.find(c => c.value === value) || (value ? { label: value, value } : null)}
            options={publishers}
            placeholder="Örn: MEB Yayınları (Seçiniz veya yazınız)"
            formatCreateLabel={(inputValue) => `"${inputValue}" olarak yeni yayınevi ekle`}
            noOptionsMessage={() => "Yayınevi bulunamadı. Lütfen adını yazıp ekleyin."}
            formatOptionLabel={(option, { context }) => {
              if (context === 'menu' && option.isPopular) {
                return (
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      Önerilen
                    </span>
                  </div>
                )
              }
              return option.label
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: errors[name] ? '#ef4444' : (state.isFocused ? '#2563eb' : '#e2e8f0'),
                borderRadius: '0.75rem',
                padding: '0.25rem',
                boxShadow: state.isFocused && !errors[name] ? '0 0 0 1px #2563eb' : 'none',
                '&:hover': {
                  borderColor: errors[name] ? '#ef4444' : '#cbd5e1'
                }
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#eff6ff' : 'white',
                color: state.isSelected ? 'white' : '#1e293b',
                cursor: 'pointer'
              })
            }}
          />
        )}
      />
      {errors[name] && (
        <p className="form-error mt-1"><AlertCircle size={14} />{errors[name].message}</p>
      )}
    </div>
  );
}
