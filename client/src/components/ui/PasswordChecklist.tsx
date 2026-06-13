interface Rule {
  label: string;
  met: boolean;
}

interface PasswordChecklistProps {
  password: string;
  confirm?: string;
  showConfirm?: boolean;
}

function getRules(password: string, confirm?: string, showConfirm?: boolean): Rule[] {
  const rules: Rule[] = [
    { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { label: 'Ao menos uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Ao menos uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Ao menos um número (0–9)', met: /[0-9]/.test(password) },
    { label: 'Ao menos um caractere especial', met: /[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/~`]/.test(password) },
  ];
  if (showConfirm && confirm !== undefined) {
    rules.push({ label: 'Senhas idênticas', met: password.length > 0 && password === confirm });
  }
  return rules;
}

export function PasswordChecklist({ password, confirm, showConfirm }: PasswordChecklistProps) {
  const rules = getRules(password, confirm, showConfirm);
  return (
    <ul className="flex flex-col gap-1 mt-1" aria-label="Requisitos de senha">
      {rules.map((rule) => (
        <li key={rule.label} className="flex items-center gap-2 text-xs font-body">
          {rule.met ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="7" fill="#0A9145" />
              <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6.5" stroke="#0A0907" strokeOpacity="0.3" />
            </svg>
          )}
          <span className={rule.met ? 'text-green' : 'text-ink/70'}>
            <span className="sr-only">{rule.met ? 'Concluído: ' : 'Pendente: '}</span>
            {rule.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function allRulesMet(password: string, confirm?: string): boolean {
  return getRules(password, confirm, !!confirm).every((r) => r.met);
}
