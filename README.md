import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerHttpRequest;
import org.springframework.web.server.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;

public class TransferFilter implements GatewayFilter {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private ObjectMapper objectMapper;  // Jackson ObjectMapper para convertir a JSON

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. Leer el cuerpo de la solicitud
        return readRequestBody(exchange)
                // 2. Convertir el cuerpo en JSON
                .flatMap(jsonBody -> {
                    // 3. Crear un nuevo ServerHttpRequest con el cuerpo modificado
                    ServerHttpRequest modifiedRequest = createModifiedRequest(exchange, jsonBody);

                    // 4. Crear un nuevo ServerWebExchange con la solicitud modificada
                    ServerWebExchange modifiedExchange = exchange.mutate()
                            .request(modifiedRequest)
                            .build();

                    // 5. Enviar la solicitud al endpoint "/score" con el cuerpo JSON
                    return sendToScoreEndpoint(jsonBody, exchange)
                            .flatMap(response -> {
                                // Continuamos con la cadena de filtros
                                return chain.filter(modifiedExchange);
                            });
                });
    }

    // Método 1: Leer el cuerpo de la solicitud
    private Mono<String> readRequestBody(ServerWebExchange exchange) {
        return exchange.getRequest().getBody().collectList().flatMap(dataBufferList -> {
            byte[] bodyBytes = concatenateBody(dataBufferList);
            try {
                // Convertir los bytes a JSON (como String)
                return Mono.just(new String(bodyBytes));
            } catch (Exception e) {
                return Mono.error(new RuntimeException("Error procesando el cuerpo", e));
            }
        });
    }

    // Método 2: Concatenar los fragmentos de DataBuffer en un solo arreglo de bytes
    private byte[] concatenateBody(List<DataBuffer> dataBufferList) {
        return dataBufferList.stream()
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    return bytes;
                })
                .reduce((first, second) -> {
                    byte[] combined = new byte[first.length + second.length];
                    System.arraycopy(first, 0, combined, 0, first.length);
                    System.arraycopy(second, 0, combined, first.length, second.length);
                    return combined;
                })
                .orElse(new byte[0]);
    }

    // Método 3: Crear una nueva solicitud ServerHttpRequest con el cuerpo modificado
    private ServerHttpRequest createModifiedRequest(ServerWebExchange exchange, String jsonBody) {
        return exchange.getRequest().mutate()
                .body(Mono.just(exchange.getResponse().bufferFactory().wrap(jsonBody.getBytes())))
                .build();
    }

    // Método 4: Enviar la solicitud al endpoint "/score"
    private Mono<String> sendToScoreEndpoint(String jsonBody, ServerWebExchange exchange) {
        return webClientBuilder.build()
                .post()
                .uri("http://localhost:8080/score")  // URL del endpoint /score
                .headers(httpHeaders -> httpHeaders.addAll(exchange.getRequest().getHeaders()))  // Mantener los headers originales
                .bodyValue(jsonBody)  // Enviar el cuerpo como JSON
                .retrieve()
                .bodyToMono(String.class);  // Aquí manejamos la respuesta del endpoint
    }
}
*******

webClient.get()
    .uri("/mi-endpoint")
    .retrieve()
    .onStatus(HttpStatus::is4xxClientError, response -> {
        // Si el código de estado es 4xx (por ejemplo 400), puedes manejarlo aquí
        return response.bodyToMono(String.class)  // Puedes capturar el cuerpo del error como un String
                .flatMap(body -> {
                    // Puedes decidir lanzar un error controlado o devolver el cuerpo del error
                    throw new CustomException("Error controlado: " + body);
                });
    })
    .onStatus(HttpStatus::is5xxServerError, response -> {
        // Manejar errores de servidor (5xx)
        return response.bodyToMono(String.class)
                .flatMap(body -> {
                    // Manejar el cuerpo del error en caso de un error de servidor
                    throw new CustomException("Error del servidor: " + body);
                });
    })
    .toEntity(MiClase.class)  // Intenta mapear el cuerpo a MiClase
    .doOnSuccess(responseEntity -> {
        // Procesar la respuesta exitosa aquí
        System.out.println("Respuesta exitosa: " + responseEntity.getBody());
    })
    .doOnError(throwable -> {
        // Manejar errores generales aquí
        System.err.println("Error: " + throwable.getMessage());
    })
    .subscribe();





******

webClient.get()
    .uri("/mi-endpoint")
    .retrieve()
    .onStatus(HttpStatus::is4xxClientError, response -> {
        // Si el código de estado es 4xx (por ejemplo 400), puedes manejarlo aquí
        return response.bodyToMono(String.class)  // Puedes capturar el cuerpo del error como un String
                .flatMap(body -> {
                    // Puedes decidir lanzar un error controlado o devolver el cuerpo del error
                    throw new CustomException("Error controlado: " + body);
                });
    })
    .onStatus(HttpStatus::is5xxServerError, response -> {
        // Manejar errores de servidor (5xx)
        return response.bodyToMono(String.class)
                .flatMap(body -> {
                    // Manejar el cuerpo del error en caso de un error de servidor
                    throw new CustomException("Error del servidor: " + body);
                });
    })
    .toEntity(MiClase.class)  // Intenta mapear el cuerpo a MiClase
    .doOnSuccess(responseEntity -> {
        // Procesar la respuesta exitosa aquí
        System.out.println("Respuesta exitosa: " + responseEntity.getBody());
    })
    .doOnError(throwable -> {
        // Manejar errores generales aquí
        System.err.println("Error: " + throwable.getMessage());
    })
    .subscribe();

