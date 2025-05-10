const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const sendMessageToWebhook = async (message: string, sessionId: string): Promise<string> => {
  const webhookUrl = 'https://primary-production-2e3b.up.railway.app/webhook/production';
  console.log('Sending message to webhook:', webhookUrl);
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message, sessionId }),
      });

      console.log(`Attempt ${attempt} - Webhook response status:`, response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Webhook response text:', text);
      
      if (!text.trim()) {
        console.log('Empty response received from webhook');
        return 'Desculpe, não consegui processar sua mensagem.';
      }

      try {
        const data = JSON.parse(text);
        console.log('Parsed webhook response:', data);
        
        if (Array.isArray(data) && data.length > 0 && data[0].output) {
          return data[0].output;
        }
        
        if (data.output) {
          return data.output;
        }
        
        return 'Desculpe, não consegui processar sua mensagem.';
      } catch (parseError) {
        console.error('Error parsing webhook response:', parseError);
        return 'Desculpe, não consegui processar sua mensagem.';
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
      }
    }
  }

  console.error('All retry attempts failed. Last error:', lastError);
  return 'Desculpe, o servidor está temporariamente indisponível. Por favor, tente novamente em alguns minutos.';
};