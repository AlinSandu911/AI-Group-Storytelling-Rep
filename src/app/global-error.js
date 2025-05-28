'use client'

export default function GlobalError({error, reset}) {
    return (
        <html>
            <body>
                <div className='min-hscree flex items-center justify-center'>
                    <div className='text-center'>
                        <h2 className='text-2xl font-bold mb-4'>Something went wrong!</h2>
                        <button onClick={reset} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Try again</button>
                    </div>
                </div>
            </body>
        </html>
    )
}