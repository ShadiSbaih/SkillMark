package com.library.Skillmark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SkillmarkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillmarkApplication.class, args);
    }

}
