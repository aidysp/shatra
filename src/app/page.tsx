'use client'


import { BoardWidget } from '@/widgets/boardWidget';




export default function Home() {




  return (
    <div className="">

      <div className='flex justify-center items-center w-[100%] h-[100vh]'>
        <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>
          <BoardWidget />
        </div>

      </div>
    </div>
  );
}