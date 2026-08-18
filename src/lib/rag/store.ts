import { lexicalSimilarity } from "./similarity";
import type { DocumentChunk, Source } from "./types";

const MIN_SCORE = 0.15;
const store: DocumentChunk[] = [
  { chunkId: "demo-generator-1", documentId: "demo-generator", documentName: "非常用発電機点検基準.pdf", page: 1, text: "非常用発電機は、月1回の目視確認と年1回の総合点検を実施する。目視確認では燃料漏れ、油量、冷却水、バッテリー端子、周囲の障害物を確認する。" },
  { chunkId: "demo-generator-2", documentId: "demo-generator", documentName: "非常用発電機点検基準.pdf", page: 2, text: "月例点検では、燃料タンクの残量、配管からの漏れ、エンジンオイルの量、冷却水の水位、バッテリーの腐食を確認し、結果を点検表へ記録する。" },
  { chunkId: "demo-generator-3", documentId: "demo-generator", documentName: "非常用発電機点検基準.pdf", page: 3, text: "年次の総合点検では、無負荷運転、負荷試験、始動時間、排気状態、冷却系統、非常用電源への切替動作を確認する。試験は有資格者が実施する。" },
  { chunkId: "demo-generator-4", documentId: "demo-generator", documentName: "非常用発電機点検基準.pdf", page: 4, text: "始動しない、異音が続く、油圧警報が出る、排気が異常に黒い場合は運転を停止し、設備管理責任者へ連絡する。原因が確認できるまで再始動しない。" },
  { chunkId: "demo-generator-5", documentId: "demo-generator", documentName: "非常用発電機点検基準.pdf", page: 5, text: "点検記録は設備管理責任者が保管する。記録には実施日、担当者、測定値、異常内容、対応内容、次回点検予定日を記載し、異常があれば修繕記録と紐付ける。" },
  { chunkId: "demo-fire-1", documentId: "demo-fire", documentName: "消防設備点検手順.pdf", page: 1, text: "火災報知設備に異常が表示された場合は、受信機の表示内容を確認し、現場を安全に確認したうえで設備管理責任者へ連絡する。" },
  { chunkId: "demo-fire-2", documentId: "demo-fire", documentName: "消防設備点検手順.pdf", page: 2, text: "受信機では、警報音、表示区域、発報した感知器または発信機、電源表示、故障表示を確認する。表示内容を確認する前に受信機をリセットしてはならない。" },
  { chunkId: "demo-fire-3", documentId: "demo-fire", documentName: "消防設備点検手順.pdf", page: 3, text: "現場確認では、煙、熱、焦げた臭い、避難経路の異常を安全な距離から確認する。火災の可能性がある場合は現場へ無理に立ち入らず、消防への通報と避難誘導を優先する。" },
  { chunkId: "demo-fire-4", documentId: "demo-fire", documentName: "消防設備点検手順.pdf", page: 4, text: "誤報または設備異常と判断した場合でも、設備管理責任者の確認後に原因を記録する。復旧操作は権限を持つ担当者が実施し、警報停止だけで対応を完了したことにしてはならない。" },
  { chunkId: "demo-fire-5", documentId: "demo-fire", documentName: "消防設備点検手順.pdf", page: 5, text: "点検記録には発生日時、受信機の表示、確認区域、現場状況、連絡先、復旧時刻、再発防止策を記載する。異常が解消しない場合は専門業者へ点検を依頼する。" },
  { chunkId: "demo-air-1", documentId: "demo-air", documentName: "空調設備マニュアル.pdf", page: 1, text: "空調機から異音が発生した場合は、運転を停止し、フィルター、ファン周辺、固定部品の状態を確認する。異音が続く場合は再運転しない。" },
  { chunkId: "demo-air-2", documentId: "demo-air", documentName: "空調設備マニュアル.pdf", page: 2, text: "フィルターの目詰まり、ファンへの異物混入、カバーや架台の緩み、ベルトの摩耗を確認する。内部へ手を入れる前に電源を遮断し、回転部が停止したことを確認する。" },
  { chunkId: "demo-air-3", documentId: "demo-air", documentName: "空調設備マニュアル.pdf", page: 3, text: "異音に加えて振動、異臭、温度低下、結露がある場合は、単純なフィルター汚れと判断しない。症状と発生時刻を記録し、設備管理責任者へ報告する。" },
  { chunkId: "demo-air-4", documentId: "demo-air", documentName: "空調設備マニュアル.pdf", page: 4, text: "確認後も異音が継続する場合は、運転を停止した状態で保全業者へ点検を依頼する。利用者がいる区域では代替空調や立入制限を検討する。" },
  { chunkId: "demo-air-5", documentId: "demo-air", documentName: "空調設備マニュアル.pdf", page: 5, text: "空調設備の点検記録には、設備番号、運転時間、異常内容、確認箇所、対応者、部品交換の有無、復旧確認日を記載する。定期清掃とフィルター交換の予定も管理する。" },
];

export function addChunks(chunks: DocumentChunk[]) {
  store.unshift(...chunks);
}

export function searchChunks(question: string, topK = 5): Source[] {
  return store.map((chunk) => ({ ...chunk, score: lexicalSimilarity(question, chunk.text) })).filter((chunk) => chunk.score >= MIN_SCORE).sort((a, b) => b.score - a.score).slice(0, topK);
}
