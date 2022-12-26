/*---- Union-find data structure ----*/
// A heavily stripped down version of the code originally from
// https://www.nayuki.io/page/disjoint-set-data-structure .
export class DisjointSet {
  private parents: Array<number> = [];
  private ranks: Array<number> = [];

  public constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.parents.push(i);
      this.ranks.push(0);
    }
  }

  public mergeSets(i: number, j: number): boolean {
    const repr0: number = this.getRepr(i);
    const repr1: number = this.getRepr(j);
    if (repr0 == repr1) return false;
    const cmp: number = this.ranks[repr0] - this.ranks[repr1];
    if (cmp >= 0) {
      if (cmp == 0) this.ranks[repr0]++;
      this.parents[repr1] = repr0;
    } else this.parents[repr0] = repr1;
    return true;
  }

  private getRepr(i: number): number {
    if (this.parents[i] != i) this.parents[i] = this.getRepr(this.parents[i]);
    return this.parents[i];
  }
}
