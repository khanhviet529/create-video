/* Can the existing replay model prove the mechanism of package 007?
 *
 * The trace is expressible: two fields (primary position, replica position) and a value that
 * lands on primary and is applied to the replica later. What matters is whether any EXISTING
 * invariant kind FAILS on it — a replay that passes the bug is not evidence of the bug. */
import { simulate } from '../../../semantic/lib/simulate.mjs';

const STATE = {
  'primary.pos': 499, 'replica.pos': 499,
  'primary.value': 0, 'replica.value': 0,   // 0 = giá trị cũ, 1 = giá trị mới
  'user.seen': 0,
};
const events = [
  { id: 'e4a', actor: 'user', op: 'write', target: 'primary', field: 'value', value: 1 },
  { id: 'e4b', actor: 'primary', op: 'write', target: 'primary', field: 'pos', value: 500 },
  { id: 'e6', actor: 'user', op: 'read', target: 'replica', field: 'value', into: 'v' },
  { id: 'e7', actor: 'user', op: 'write', target: 'user', field: 'seen', value: { expr: 'v' } },
  { id: 'e9a', actor: 'replica', op: 'write', target: 'replica', field: 'value', value: 1 },
  { id: 'e9b', actor: 'replica', op: 'write', target: 'replica', field: 'pos', value: 500 },
];
const INV = [
  { id: 'primary_ends_correct', kind: 'final_state', field: 'primary.value', expected: 1 },
  { id: 'replica_catches_up', kind: 'final_state', field: 'replica.value', expected: 1 },
  { id: 'nothing_clobbered', kind: 'no_lost_write', field: 'primary.value' },
  { id: 'primary_pos_rises', kind: 'monotonic', field: 'primary.pos', direction: 'never_decreases' },
  { id: 'replica_pos_rises', kind: 'monotonic', field: 'replica.pos', direction: 'never_decreases' },
  { id: 'replica_value_rises', kind: 'monotonic', field: 'replica.value', direction: 'never_decreases' },
  { id: 'no_stale_basis_write', kind: 'mutual_exclusion', field: 'primary.value' },
];

const r = simulate({}, { state: STATE, events, invariants: INV });
console.log('lỗi mô hình:', r.problems && r.problems.length ? r.problems : 'không có');
for (const m of r.invariants || []) {
  console.log((m.holds ? '  ĐẠT  ' : '  PHÁ  ') + String(m.id).padEnd(24) + String(m.detail || '').slice(0, 78));
}
const seen = (r.trace || []).find((x) => x.id === 'e6');
console.log('\ncâu đọc e6 quan sát được: ' + JSON.stringify(seen && { value: seen.value, version: seen.version }));
const broke = (r.invariants || []).filter((m) => !m.holds).length;
console.log('=> ' + broke + '/' + INV.length + ' invariant bị phá bởi một trace CHÍNH LÀ cái lỗi.');
