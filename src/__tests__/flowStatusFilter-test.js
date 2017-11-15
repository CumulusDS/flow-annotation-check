'use strict';

/**
 * @flow
 */

import flowStatusFilter from '../flowStatusFilter';

const BASIC_REPORT = [
  {status: 'flow strict', file: './s.js'},
  {status: 'flow', file: './a.js'},
  {status: 'flow weak', file: './b.js'},
  {status: 'no flow', file: './c.js'},
];

describe('flowStatusFilter', () => {
  it('should keep all entries with the `all` filter', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('all', false))).toHaveLength(4);
  });

  it('should remove all entries with the `none` filter', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('none', false))).toHaveLength(0);
  });

  it('should keep only the flow-strict file when flowstrict is used', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flowstrict', false))).toHaveLength(1);
    expect(BASIC_REPORT.filter(flowStatusFilter('flowstrict', true))).toHaveLength(1);
  });

  it('should keep only the flow and flow-strict files when allowWeak is false', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flow', false))).toHaveLength(2);
  });

  it('should keep the flow, flow-strict and flow-weak files when allowWeak is true', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flow', true))).toHaveLength(3);
  });

  it('should always only keep flow-weak files', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flowweak', false))).toHaveLength(1);
    expect(BASIC_REPORT.filter(flowStatusFilter('flowweak', true))).toHaveLength(1);
  });

  it('should keep both the no-flow and flow-weak files when allowWeak is false', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('noflow', false))).toHaveLength(2);
  });

  it('should keep only the no-flow file when allowWeak is true', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('noflow', true))).toHaveLength(1);
  });
});
