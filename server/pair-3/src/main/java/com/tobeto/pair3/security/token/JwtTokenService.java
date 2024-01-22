package com.tobeto.pair3.security.token;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tobeto.pair3.entities.User;
import com.tobeto.pair3.security.dtos.Credentials;
import com.tobeto.pair3.services.abstracts.UserService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;


@Service
@RequiredArgsConstructor
public class JwtTokenService {

    SecretKey key= Keys.hmacShaKeyFor("secret-must-be-at-least-32-chars".getBytes());
    SecretKey key1 = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private ObjectMapper objectMapper=new ObjectMapper();

    private final UserService userService;




    public Token CreateToken(User user, Credentials credentials) {
        TokenSubject tokenSubject=new TokenSubject(user.getId());
        //long expirationMillis = System.currentTimeMillis() + (24 * 60 * 60 * 1000); // 24 saat
        long expirationMillis = System.currentTimeMillis() + ( 5*60 * 1000);
        Date expirationDate = new Date(expirationMillis);
        try {
            String subject=objectMapper.writeValueAsString(tokenSubject);
            String token= Jwts.builder().setSubject(subject).setExpiration(expirationDate).signWith(key).compact();
            return new Token(token,"Bearer");
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

    }


    public User verifyToken(String authorizationHeader) {
        if(authorizationHeader==null) return null;
        String token = authorizationHeader.split(" ")[1];
        JwtParser parser=Jwts.parserBuilder().setSigningKey(key).build();
      try {
          Jws<Claims> claims= parser.parseClaimsJws(token);
          var subject=claims.getBody().getSubject();
         var tokenSubject= objectMapper.readValue(subject,TokenSubject.class);

          User user=userService.getOriginalUserById(tokenSubject.id);
          return user;
      }catch (JwtException ex){
          ex.printStackTrace();
      } catch (JsonProcessingException e) {
          throw new RuntimeException(e);
      }
        return null;
        

    }



    public static record TokenSubject (int id){}
}
