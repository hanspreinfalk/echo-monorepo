import Vapi from "@vapi-ai/web"
import { useState, useEffect } from "react"

interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
}

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])

    useEffect(() => {
        // Only for testing the vapi api, otherwise customers will provide their own api key
        const vapiInstance = new Vapi("48492c23-112b-44f8-913c-c7925dcdd1cd")
        setVapi(vapiInstance)

        vapiInstance.on('call-start', () => {
            setIsConnected(true)
            setIsConnecting(false)
            setTranscript([])
        })

        vapiInstance.on('call-end', () => {
            setIsConnected(false)
            setIsConnecting(false)
            setIsSpeaking(false)
        })

        vapiInstance.on('speech-start', () => {
            setIsSpeaking(true)
        })

        vapiInstance.on('speech-end', () => {
            setIsSpeaking(false)
        })

        vapiInstance.on('error', (error) => {
            console.log('Vapi error:', error)
            setIsConnecting(false)
        })

        vapiInstance.on('message', (message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setTranscript((prev) => [
                    ...prev, 
                    { 
                        role: message.role === 'user' ? 'user' : 'assistant', 
                        text: message.transcript 
                    }
                ])
            }
        })

        return () => {
            vapiInstance?.stop();
        }
    }, [])

    const startCall = () => {
        setIsConnecting(true)

        if (vapi) {
            // Only for testing the vapi api, otherwise customers will provide their own Assistant ids
            vapi.start('2baddffd-8ca5-4cc8-a144-97b45fa4031a');
        }
    }

    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    }

    return {
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall,
    }
}