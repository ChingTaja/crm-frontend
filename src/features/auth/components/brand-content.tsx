import { ArrowUpRight, Check, Layers, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function BrandContent() {
  return (
      <section className="relative flex flex-col overflow-hidden bg-[#ecf2ed] px-6 py-6 min-[761px]:min-h-svh min-[761px]:px-8 min-[761px]:pt-8 min-[1001px]:px-[52px] min-[1001px]:pt-[42px] min-[1500px]:px-[70px]" aria-label="Connect CRM 介紹">
        <a className="flex w-fit items-center gap-2.5 rounded-md text-2xl font-semibold tracking-tight text-[#183f32] focus-visible:outline-2 focus-visible:outline-offset-4 min-[761px]:text-[27px]" href="/" aria-label="Connect CRM 首頁">
          <span className="grid size-[34px] place-items-center rounded-xl bg-[#245340] text-white min-[761px]:size-[38px]">
            <Layers size={23} />
          </span>
          Connect<span className="ml-px rounded border border-[#bccbc0] px-1.5 py-0.5 text-[10px] tracking-wider">CRM</span>
        </a>
        <div className="w-full pt-6 pb-2 min-[761px]:m-auto min-[761px]:max-w-[510px] min-[761px]:pt-16 min-[761px]:pb-11 min-[1500px]:max-w-[550px]">
          <div className="flex items-center gap-2 text-[8px] font-semibold tracking-[1.8px] text-[#557765] min-[761px]:text-[9px] [&>span]:size-1.5 [&>span]:rounded-full [&>span]:bg-[#789b69]">
            <span /> BETTER CONNECTIONS, BETTER BUSINESS
          </div>
          <h1 className="mt-3 mb-2 text-[28px] leading-[1.45] font-semibold tracking-wide min-[761px]:mt-6 min-[761px]:mb-5 min-[761px]:text-[31px] min-[761px]:leading-[1.55] min-[1001px]:text-[clamp(30px,3.15vw,48px)] [&>br]:hidden min-[761px]:[&>br]:block">
            每一次連結，
            <br />
            都是成長的開始<span className="text-[#739360]">。</span>
          </h1>
          <p className="mb-1 text-xs leading-loose tracking-wide text-[#6b7e73] min-[761px]:text-sm [&>br]:hidden min-[761px]:[&>br]:block">
            讓客戶、團隊與商機緊密相連。
            <br />
            在同一個工作空間，成就更好的客戶關係。
          </p>
          <div className="relative mt-5 mb-1 hidden h-[260px] place-items-center min-[761px]:grid min-[1500px]:mt-10 min-[1500px]:mb-6" aria-label="客戶關係管理示意">
            <div className="absolute h-[230px] w-80 -rotate-[23deg] rounded-[50%] border border-[#d9e3d8]" />
            <div className="absolute h-[165px] w-[340px] rotate-[26deg] rounded-[50%] border border-[#d9e3d8] min-[1001px]:w-[410px]" />
            <Card className="z-10 w-[310px] max-w-[90%] -rotate-[5deg] gap-0 rounded-2xl border border-white bg-white/95 p-5 shadow-xl shadow-[#3e6448]/5">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <span className="grid size-8 place-items-center rounded-lg bg-[#edf3ed] text-[#52765b]">
                  <Users size={18} />
                </span>
                <span>建立有價值的關係</span>
                <span className="ml-auto size-1.5 rounded-full bg-[#7b9d65]" />
              </div>
              <div className="flex pt-5 pb-4 pl-1 [&>span]:-ml-1 [&>span]:grid [&>span]:size-10 [&>span]:place-items-center [&>span]:rounded-full [&>span]:border-[3px] [&>span]:border-white [&>span]:text-xs">
                <span className="bg-[#e9dcca] text-[#79674f]">林</span>
                <span className="bg-[#dbe3e8] text-[#57727d]">陳</span>
                <span className="bg-[#dedfcb] text-[#717350]">王</span>
                <span className="bg-[#e8d8d6] text-[#8a625d]">李</span>
                <span className="bg-[#edf1eb] text-[#60735c]">+N</span>
              </div>
              <div className="h-px bg-[#edf0ec]" />
              <div className="flex items-center justify-between pt-3 text-[10px] text-[#7b8a80]">
                <span>每一位客戶，都值得用心經營</span>
                <ArrowUpRight size={18} />
              </div>
            </Card>
            <div className="absolute right-0 bottom-6 z-20 flex rotate-[4deg] items-center gap-2 rounded-xl border border-[#e2e9de] bg-[#fdfefb] px-4 py-3 text-[11px] shadow-lg shadow-[#3e6448]/5 [&>span]:grid [&>span]:size-6 [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#e9f0d9] [&>span]:text-[#6e8652]">
              <span>
                <Check size={14} />
              </span>
              讓合作，更進一步
            </div>
            <div className="absolute top-5 right-3 text-[38px] text-[#8ca375]">✳</div>
            <div className="absolute bottom-10 left-1 text-[26px] text-[#8ca375]">+</div>
          </div>
          <div className="hidden flex-wrap gap-2.5 text-[10px] text-[#647b6b] min-[761px]:flex min-[1001px]:gap-4 min-[1001px]:text-[11px] [&>span]:flex [&>span]:items-center [&>span]:gap-1">
            <span>
              <Check size={15} /> 客戶資料整合
            </span>
            <span>
              <Check size={15} /> 商機進度追蹤
            </span>
            <span>
              <Check size={15} /> 團隊協作
            </span>
          </div>
        </div>
        <div className="hidden items-center justify-between text-[8px] tracking-widest text-[#8b9a8e] min-[761px]:flex [&>span]:text-[22px]">
          MADE FOR MEANINGFUL CONNECTIONS<span>✳</span>
        </div>
      </section>
  )
}
