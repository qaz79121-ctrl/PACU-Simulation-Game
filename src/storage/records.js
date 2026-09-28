const KEY='pacu-mission-records-v1'
export function createRecordStore(storage=globalThis.localStorage) {
  return {
    load(){ try { const raw=storage?.getItem(KEY); return {records:raw?JSON.parse(raw):[]} } catch { return {records:[],warning:'紀錄資料無法讀取，已略過損毀內容。'} } },
    save(record){ const current=this.load().records; try { storage?.setItem(KEY,JSON.stringify([...current,record])); return {ok:true} } catch { return {ok:false,warning:'此裝置無法保存紀錄。'} } },
    clear(){ try { storage?.removeItem(KEY); return {ok:true} } catch { return {ok:false} } }
  }
}
const csvValue=v=>`"${String(v??'').replaceAll('"','""')}"`
export function recordsToCsv(records){ return ['學員代碼,完成時間,總分,結果',...records.map(r=>[r.learnerId,r.completedAt,r.total,r.status].map(csvValue).join(','))].join('\n') }
