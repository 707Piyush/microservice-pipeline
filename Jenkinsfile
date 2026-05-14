pipeline {
    agent any

    environment {
        IMAGE_NAME = "piyushgupta7781/microservice-app"
        BUILD_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:${BUILD_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage('Push') {
            steps {
                echo 'Pushing image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${BUILD_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to Kubernetes...'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh "kubectl apply -f k8s/deployment.yaml"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
    }
}